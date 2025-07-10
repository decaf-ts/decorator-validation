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

export type ValidationDecoratorDefinitionAsync = ValidationDecoratorDefinition & { async: boolean };

export type ValidationPropertyDecoratorDefinitionAsync = {
  prop: string | symbol;
  decorators: ValidationDecoratorDefinitionAsync[];
};

export type DecoratorMetadataAsync = DecoratorMetadata & { async: boolean };

export function validateNestedProps<M extends Model, Async extends boolean = false>(
  obj: M,
  props: string[],
  async?: Async
): ConditionalAsync<Async, ModelErrors> | undefined {
  const result: Record<string, string | string[] | Promise<string | string[] | undefined>> = {};
  const reserved = Object.values(ReservedModels).map((v) => v.toLowerCase());

  for (const prop of props) {
    const allDecorators = Reflection.getPropertyDecorators(
      ValidationKeys.REFLECT,
      obj,
      prop
    ).decorators;

    const decorators = [...allDecorators].filter((d) =>
      [ModelKeys.TYPE, ValidationKeys.TYPE as string].includes(d.key)
    );

    if (!decorators || !decorators.length) continue;

    const dec = decorators.pop() as DecoratorMetadata;

    const clazz = dec.props.name
      ? [dec.props.name]
      : Array.isArray(dec.props.customTypes)
        ? dec.props.customTypes
        : [dec.props.customTypes];

    for (const c of clazz) {
      if (!reserved.includes(c.toLowerCase())) continue;

      const rawValue = (obj as any)[prop];
      const typeDecoratorKey = Array.isArray(rawValue) ? ValidationKeys.LIST : ValidationKeys.TYPE;

      const types = (allDecorators.find((d) => {
        return d.key === typeDecoratorKey;
      }) || {}) as DecoratorMetadata<any>;

      let allowedTypes: string[] = [];
      if (types?.props) {
        const customTypes = Array.isArray(rawValue) ? types.props.class : types.props.customTypes;

        if (customTypes) {
          allowedTypes = Array.isArray(customTypes)
            ? customTypes.map((t) => `${t}`.toLowerCase())
            : [customTypes.toLowerCase()];
        }
      }

      const validate = (value: any): any => {
        if (typeof value !== "object" && typeof value !== "function") {
          return async ? Promise.resolve(undefined) : undefined;
        }

        try {
          if (value && !value[VALIDATION_PARENT_KEY]) value[VALIDATION_PARENT_KEY] = obj;

          if (Model.isModel(value)) {
            return async ? Promise.resolve(value.hasErrors()) : value.hasErrors();
          }

          const isValidType = allowedTypes.includes(typeof value);
          const errorMessage = "Value has no validatable type";
          if (async) {
            return isValidType ? Promise.resolve(undefined) : Promise.resolve(errorMessage);
          }

          return isValidType ? undefined : errorMessage;
        } catch (e: any) {
          const msg = e instanceof Error ? e.message : "Validation exception";
          return async ? Promise.resolve(msg) : msg;
        } finally {
          if (value && value[VALIDATION_PARENT_KEY]) delete value[VALIDATION_PARENT_KEY];
        }
      };

      let err: Promise<any | any[] | undefined> | any | any[] | undefined;
      switch (c) {
        case Array.name:
        case Set.name: {
          const listDec = allDecorators.find((d) => d.key === ValidationKeys.LIST);

          if (listDec && rawValue) {
            const iterable = c === Array.name ? rawValue : rawValue.values(); // .values() if is a set
            const validations = Array.from(iterable).map((v) => validate(v)); // Always resolves as Promise.resolve()
            if (async) {
              // TODO: change to allSettled
              err = Promise.all(validations).then((results) => {
                const filtered = results.filter((r) => r !== undefined);
                return filtered.length ? filtered : undefined;
              });
            } else {
              const filtered = validations.filter((r) => r !== undefined);
              err = filtered.length ? filtered : undefined;
            }
          }
          break;
        }
        default: {
          if (rawValue) {
            err = validate(rawValue);
          }
        }
      }

      if (err) {
        result[prop] = err;
      }
    }
  }

  if (!async) return Object.keys(result).length ? (result as any) : undefined;

  const keys = Object.keys(result);
  const promises = Object.values(result) as Promise<string | string[] | undefined>[];

  return Promise.allSettled(promises).then((resolved) => {
    const response: ModelErrors = {};
    for (let i = 0; i < resolved.length; i++) {
      const r = resolved[i];
      const key = keys[i];

      if (r.status === "fulfilled" && r.value !== undefined) {
        (response as any)[key] = r.value;
      } else if (r.status === "rejected") {
        (response as any)[key] =
          r.reason instanceof Error ? r.reason.message : String(r.reason || "Validation failed");
      }
    }

    return Object.keys(response).length ? response : undefined;
  }) as any;
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

  const result: ModelErrors | Promise<ModelErrors> | undefined = {};

  for (const { prop, decorators } of decoratedProperties) {
    // const { prop, decorators } = decoratedProperty;

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

  const nestedProps = Object.keys(obj).filter((prop) => Model.isModel((obj as any)[prop]));
  const nestedErrors = validateNestedProps(obj, nestedProps, async);

  if (!async) {
    const merged = {
      ...result,
      ...(nestedErrors || {}),
    } as ModelErrors;
    const hasErrors = Object.keys(merged).length > 0;
    return (hasErrors ? new ModelErrorDefinition(merged) : undefined) as any;
  }

  return (nestedErrors as Promise<ModelErrors | undefined>).then((nestedResolved) => {
    const merged = {
      ...result,
      ...(nestedResolved || {}),
    } as ModelErrors;

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

      return Object.keys(result).length > 0 ? new ModelErrorDefinition(result) : undefined;
    });
  }) as any;
}
