import { ModelErrorDefinition } from "./ModelErrorDefinition";
import { DecoratorMetadata, Reflection } from "@decaf-ts/reflection";
import { ModelKeys } from "../utils/constants";
import { Model } from "./Model";
import { Validation } from "../validation/Validation";
import { ValidationKeys } from "../validation/Validators/constants";
import { ModelErrors, ValidationDecoratorDefinition } from "../validation/types";
import { PathProxyEngine } from "../utils/PathProxy";
import { ReservedModels } from "./constants";
import { VALIDATION_PARENT_KEY } from "../constants";
import { ConditionalAsync } from "../validation";
import { Validatable } from "./types";

export type ValidationDecoratorDefinitionAsync = ValidationDecoratorDefinition & { async: boolean };

export type ValidationPropertyDecoratorDefinitionAsync = {
  prop: string | symbol;
  decorators: ValidationDecoratorDefinitionAsync[];
};

export type DecoratorMetadataAsync = DecoratorMetadata & { async: boolean };

export function validateNestedProps<M extends Model>(
  obj: M,
  props: string[]
): ModelErrors | undefined {
  let errs: ModelErrors | undefined = undefined;

  for (const prop of props) {
    let err: string | undefined;
    const allDecorators = Reflection.getPropertyDecorators(
      ValidationKeys.REFLECT,
      obj,
      prop
    ).decorators;

    const decorators = [...allDecorators].filter(
      (d: { key: string }) => [ModelKeys.TYPE, ValidationKeys.TYPE as string].indexOf(d.key) !== -1
    );

    if (!decorators || !decorators.length) continue;

    const dec = decorators.pop() as DecoratorMetadata;
    const clazz = dec.props.name
      ? [dec.props.name]
      : Array.isArray(dec.props.customTypes)
        ? dec.props.customTypes
        : [dec.props.customTypes];

    const reserved = Object.values(ReservedModels).map((v) => v.toLowerCase()) as string[];

    for (const c of clazz) {
      if (!(reserved.indexOf(c.toLowerCase()) === -1)) continue;

      const typeDecoratorKey = Array.isArray((obj as any)[prop])
        ? ValidationKeys.LIST
        : ValidationKeys.TYPE;

      const types: any =
        allDecorators.find((d: { key: string }) => d.key === typeDecoratorKey) || {};

      let allowedTypes: string[] = [];
      if (types && types.props) {
        const customTypes = Array.isArray((obj as any)[prop])
          ? types.props.class
          : types.props.customTypes;
        if (customTypes)
          allowedTypes = Array.isArray(customTypes)
            ? customTypes.map((t) => `${t}`.toLowerCase())
            : [customTypes.toLowerCase()];
      }

      const validate = (prop: string, value: any): any => {
        if (typeof value !== "object" && typeof value !== "function") return undefined;

        try {
          if (value && !value[VALIDATION_PARENT_KEY]) value[VALIDATION_PARENT_KEY] = obj;

          return Model.isModel(value)
            ? value.hasErrors()
            : allowedTypes.includes(typeof value)
              ? undefined
              : "Value has no validatable type";
        } finally {
          if (value && value[VALIDATION_PARENT_KEY]) delete value[VALIDATION_PARENT_KEY];
        }
      };

      switch (c) {
        case Array.name:
        case Set.name:
          if (allDecorators.length) {
            const listDec = allDecorators.find(
              (d: { key: string }) => d.key === ValidationKeys.LIST
            );
            if (listDec) {
              err = (
                c === Array.name
                  ? (obj as Record<string, any>)[prop]
                  : // If it's a Set
                    (obj as Record<string, any>)[prop].values()
              )
                .map((v: Validatable<true | false>) => validate(prop, v))
                .filter((e: any) => !!e) as any;

              if (!err?.length) {
                err = undefined;
              }
            }
          }
          break;
        default:
          try {
            if ((obj as Record<string, any>)[prop]) err = validate(prop, (obj as any)[prop]);
          } catch (e: unknown) {
            console.warn(`Model should be validatable but its not: ${e}`);
          }
      }

      if (err) {
        errs = errs || {};
        errs[prop] = err as any;
      }
    }
  }

  return errs;
}

export function getValidatableProperties(
  obj: any,
  propsToIgnore: string[]
): ValidationPropertyDecoratorDefinitionAsync[] {
  const decoratedProperties: ValidationPropertyDecoratorDefinitionAsync[] = [];

  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop) && !propsToIgnore.includes(prop)) {
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

export function validateDecorators<IsAsync extends boolean = false>(
  obj: any,
  prop: string | symbol,
  decorators: DecoratorMetadataAsync[],
  async?: IsAsync
): ConditionalAsync<IsAsync, Record<string, string>> | undefined {
  const result: Record<string, string | Promise<string>> = {};

  for (const decorator of decorators) {
    const validator = Validation.get(decorator.key);
    if (!validator) {
      throw new Error(`Missing validator for ${decorator.key}`);
    }

    if (validator.async && !async) {
      console.warn("...");
      continue;
    }

    const decoratorProps =
      decorator.key === ModelKeys.TYPE ? [decorator.props] : decorator.props || {};

    const value = (obj as any)[prop.toString()];
    const context = PathProxyEngine.create(obj, {
      ignoreUndefined: true,
      ignoreNull: true,
    });

    const maybeError = validator.hasErrors(value, decoratorProps, context); // string | undefined
    if (async) {
      result[decorator.key] = Promise.resolve(maybeError);
    } else if (maybeError) {
      result[decorator.key] = maybeError;
    }
  }

  if (async) {
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

  return Object.keys(result).length > 0 ? (result as any) : undefined;
}

export function validate<M extends Model, Async extends boolean = false>(
  obj: M,
  async?: Async,
  ...propsToIgnore: string[]
): ConditionalAsync<Async, ModelErrorDefinition | undefined> {
  const decoratedProperties: ValidationPropertyDecoratorDefinitionAsync[] =
    getValidatableProperties(obj, propsToIgnore);

  const result: ModelErrors | Promise<ModelErrors> = {};

  for (const decoratedProperty of decoratedProperties) {
    const { prop, decorators } = decoratedProperty;

    if (!decorators?.length) continue;

    const defaultTypeDecorator = decorators[0];

    const hasExplicitType = decorators.find((d) => {
      if (d.key === ValidationKeys.TYPE) return true;
      return !!d.props.types?.find((t) => t === defaultTypeDecorator.props.name);
    });

    if (hasExplicitType) {
      decorators.shift(); // remove the design:type decorator
    }

    const errs = validateDecorators(obj, prop, decorators, async);
    if (errs) {
      (result as any)[prop.toString()] = errs;
    }
  }

  const nestedErrors = validateNestedProps(
    obj,
    Object.keys(obj).filter((prop) => !result?.[prop]),
    async
  );

  const merged = {
    ...result,
    // ...(nestedErrors || {})
  } as ModelErrors;

  if (!async) {
    const hasErrors = Object.keys(merged).length > 0;
    return (hasErrors ? new ModelErrorDefinition(merged) : undefined) as any;
  }

  // flat promises
  const keys = Object.keys(merged);
  // const promises = keys.map((key: string) => {
  //   const val = merged[key];
  //   if (val && typeof val === "object" && val.constructor === Object) {
  //     // nested Record<string, Promise<string>>
  //     const nestedKeys = Object.keys(val);
  //     const nestedPromises = Object.values(val) as unknown as Promise<
  //       string | string[] | undefined
  //     >[];
  //     return Promise.all(nestedPromises).then((resolved) => {
  //       const final: any = {};
  //       for (let i = 0; i < resolved.length; i++) {
  //         const r = resolved[i];
  //         if (r !== undefined) {
  //           final[nestedKeys[i]] = r;
  //         }
  //       }
  //       return [key, Object.keys(final).length ? final : undefined];
  //     });
  //   } else {
  //     return Promise.resolve([key, undefined]); // shouldn't happen
  //   }
  // });

  // return Promise.all(Object.values(merged)).then((entries) => {
  //   const final: ModelErrors = {};
  //   for (const [key, val] of entries) {
  //     if (val !== undefined) {
  //       final[key] = val;
  //     }
  //   }
  //   return (Object.keys(final).length > 0 ? new ModelErrorDefinition(final) : undefined) as any;
  // }) as any;

  const promises = Object.values(merged);
  return Promise.allSettled(promises).then((results) => {
    const result: ModelErrors = {};
    for (let i = 0; i < results.length; i++) {
      const key = keys[i];
      const res = results[i];

      if (res.status === "fulfilled" && res.value !== undefined) {
        (result as any)[key] = res.value;
      }

      if (res.status === "rejected")
        (result as any)[key] =
          res.reason instanceof Error
            ? res.reason.message
            : String(res.reason || "Validation failed");
    }

    return new ModelErrorDefinition(result);
  }) as any;
}
