import { ModelErrorDefinition } from "./ModelErrorDefinition";
import { DecoratorMetadata, Reflection } from "@decaf-ts/reflection";
import { ModelKeys } from "../utils/constants";
import { Model } from "./Model";
import { Validation } from "../validation/Validation";
import { ValidationKeys } from "../validation/Validators/constants";
import {
  ModelErrors,
  ValidationDecoratorDefinition,
} from "../validation/types";
import { PathProxyEngine } from "../utils/PathProxy";
import { ConditionalAsync } from "../validation";

export type ValidationDecoratorDefinitionAsync =
  ValidationDecoratorDefinition & { async: boolean };

export type ValidationPropertyDecoratorDefinitionAsync = {
  prop: string | symbol;
  decorators: ValidationDecoratorDefinitionAsync[];
};

export type DecoratorMetadataAsync = DecoratorMetadata & { async: boolean };

export function getValidatableProperties(
  obj: any,
  propsToIgnore: string[]
): ValidationPropertyDecoratorDefinitionAsync[] {
  const decoratedProperties: ValidationPropertyDecoratorDefinitionAsync[] = [];

  for (const prop in obj) {
    if (
      Object.prototype.hasOwnProperty.call(obj, prop) &&
      !propsToIgnore.includes(prop)
    ) {
      decoratedProperties.push(
        Reflection.getPropertyDecorators(
          ValidationKeys.REFLECT,
          obj,
          prop
        ) as unknown as ValidationPropertyDecoratorDefinitionAsync
      );
    }
  }

  return decoratedProperties;
}

export function validateDecorator<IsAsync extends boolean = false>(
  obj: any,
  value: any,
  decorator: DecoratorMetadataAsync,
  async?: IsAsync
): ConditionalAsync<IsAsync, string | undefined> {
  const validator = Validation.get(decorator.key);
  if (!validator) {
    throw new Error(`Missing validator for ${decorator.key}`);
  }

  if (validator.async && !async) {
    console.warn("...");
  }

  const decoratorProps =
    decorator.key === ModelKeys.TYPE
      ? [decorator.props]
      : decorator.props || {};

  const context = PathProxyEngine.create(obj, {
    ignoreUndefined: true,
    ignoreNull: true,
  });

  const maybeError = validator.hasErrors(value, decoratorProps, context) as any; // string | undefined
  // @ts-expect-error ...
  return async ? Promise.resolve(maybeError) : maybeError;
}

export function validateDecorators<IsAsync extends boolean = false>(
  obj: any,
  value: any,
  decorators: DecoratorMetadataAsync[],
  async?: IsAsync
): ConditionalAsync<IsAsync, Record<string, string>> | undefined {
  const result: Record<string, string | Promise<string>> = {};

  for (const decorator of decorators) {
    let err = validateDecorator(obj, value, decorator, async);

    // if decorator is a list and has values, and no errors, so, each element must be check
    if (!err && decorator.key === ValidationKeys.LIST) {
      const values = value instanceof Set ? [...value] : value;
      if (values && values.length > 0) {
        const types = decorator.props.class || decorator.props.customTypes;
        const allowedTypes = [types].flat().map((t) => String(t).toLowerCase());
        const errs = values.flatMap((v: any) => {
          if (Model.isModel(v)) return v.hasErrors() || [];
          return allowedTypes.includes(typeof v)
            ? []
            : ["Value has no validatable type"];
        });
        err = errs.length > 0 ? errs : undefined;
      }
    }

    if (err) (result as any)[decorator.key] = err;
  }

  if (!async)
    return Object.keys(result).length > 0 ? (result as any) : undefined;

  const keys = Object.keys(result);
  const promises = Object.values(result) as Promise<string | undefined>[];
  return Promise.all(promises).then((resolvedValues) => {
    const res: Record<string, string> = {};
    for (let i = 0; i < resolvedValues.length; i++) {
      const val = resolvedValues[i];
      if (val !== undefined) {
        res[keys[i]] = val;
      }
    }
    return Object.keys(res).length > 0 ? res : undefined;
  }) as any;
}

export function validate<M extends Model, Async extends boolean = false>(
  obj: M,
  async?: Async,
  ...propsToIgnore: string[]
): ConditionalAsync<Async, ModelErrorDefinition | undefined> {
  const decoratedProperties: ValidationPropertyDecoratorDefinitionAsync[] =
    getValidatableProperties(obj, propsToIgnore);

  const result: Record<string, any> = {};
  for (const { prop, decorators } of decoratedProperties) {
    const propValue = (obj as any)[prop];

    if (!decorators?.length) continue;

    // check if we can skip the default type validator
    const designTypeDec = [...(decorators || [])].find((d) =>
      [ModelKeys.TYPE, ValidationKeys.TYPE].includes(d.key as any)
    );
    if (!designTypeDec) continue;

    const designType = designTypeDec.props.name;

    if ([Array.name, Set.name].includes(designType)) {
      // Check for @list decorator on array or Set properties
      if (!decorators.some((d) => d.key === ValidationKeys.LIST))
        throw new Error(
          `Property '${String(prop)}' requires a @list decorator`
        );

      if (propValue && !(Array.isArray(propValue) || propValue instanceof Set))
        throw new Error(
          `Property '${String(prop)}' must be either an array or a Set`
        );

      // remove design:type decorator, becauf of @list decorator
      for (let i = decorators.length - 1; i >= 0; i--) {
        if (decorators[i].key === ModelKeys.TYPE) {
          decorators.splice(i, 1); // Remove apenas ModelKeys.TYPE se houver ValidationKeys.TYPE
        }
      }
    }

    let errs: Record<string, any> =
      validateDecorators(obj, propValue, decorators, async) || {};

    // check for nested props
    // errors para evitar processamento desnecessário; propValue pra caso o valor for undefined;
    const Constr = Model.isPropertyModel(obj, String(prop));
    if (propValue && Constr) {
      const instance: Model = propValue;
      if (
        typeof instance !== "object" ||
        !instance.hasErrors ||
        typeof instance.hasErrors !== "function"
      ) {
        errs[ValidationKeys.TYPE] = "Model should be validatable but it's not."; // if async, the error is return/exist
      } else {
        const validationErrors = instance.hasErrors();
        const nestedErrors = Object.entries(validationErrors || {}).reduce(
          (accumulatedErrors, [field, error]) => ({
            ...accumulatedErrors,
            [`${String(prop)}.${field}`]: error,
          }),
          {}
        );

        if (Object.keys(nestedErrors).length > 0)
          errs = Object.assign({}, errs, nestedErrors);
      }
    }

    if (Object.keys(errs).length > 0) result[String(prop)] = errs;
  }

  const merged: any = result; // aplicar filtro

  if (!async)
    return Object.keys(merged).length > 0
      ? new ModelErrorDefinition(merged)
      : undefined;

  // flat promises
  const keys = Object.keys(merged);
  const promises = Object.values(merged);
  return Promise.allSettled(promises).then(async (results) => {
    const result: ModelErrors = {};
    for (let i = 0; i < results.length; i++) {
      const key = keys[i];
      const res = results[i];

      if (res.status === "fulfilled" && res.value !== undefined) {
        (result as any)[key] = res.value;
      } else if (res.status === "rejected") {
        (result as any)[key] =
          res.reason instanceof Error
            ? res.reason.message
            : String(res.reason || "Validation failed");
      }
    }
    return Object.keys(result).length > 0
      ? new ModelErrorDefinition(result)
      : undefined;
  }) as any;
}
