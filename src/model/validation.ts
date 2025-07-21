import { ModelErrorDefinition } from "./ModelErrorDefinition";
import { DecoratorMetadata, Reflection } from "@decaf-ts/reflection";
import { ModelKeys } from "../utils/constants";
import { Model } from "./Model";
import { Validation } from "../validation/Validation";
import { ValidationKeys } from "../validation/Validators/constants";
import type {
  ModelErrors,
  ValidationDecoratorDefinition,
  ValidatorOptions,
} from "../validation/types";
import { PathProxyEngine } from "../utils/PathProxy";
import { ConditionalAsync } from "../validation";
import { ASYNC_META_KEY, VALIDATION_PARENT_KEY } from "../constants";

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

/**
 * Executes validation with temporary context and returns the validation result
 *
 * @param targetInstance - The instance to validate
 * @param parentReference - Reference to a parent object for nested validation
 * @param isAsync - Whether to perform async validation
 * @returns Validation result from hasErrors()
 */
function getNestedValidationErrors<M extends Model>(
  targetInstance: M,
  parentReference?: M,
  isAsync: boolean = false
): ModelErrorDefinition | undefined {
  // Set temporary context for nested models
  if (parentReference) {
    setTemporaryContext(targetInstance, VALIDATION_PARENT_KEY, parentReference);
  }
  setTemporaryContext(targetInstance, ASYNC_META_KEY, isAsync);
  const errs = targetInstance.hasErrors();
  if (parentReference) {
    cleanupTemporaryContext(targetInstance, VALIDATION_PARENT_KEY);
  }
  cleanupTemporaryContext(targetInstance, ASYNC_META_KEY);
  return errs;
}

export function validateDecorator<
  M extends Model,
  Async extends boolean = false,
>(
  obj: M,
  value: any,
  decorator: DecoratorMetadataAsync,
  async?: Async
): ConditionalAsync<Async, string | undefined> {
  const validator = Validation.get(decorator.key);
  if (!validator) {
    throw new Error(`Missing validator for ${decorator.key}`);
  }

  // skip async decorators if validateDecorators is called synchronously (async = false)
  if (!async && decorator.props.async) return undefined as any;

  const decoratorProps =
    decorator.key === ModelKeys.TYPE
      ? [decorator.props]
      : decorator.props || {};

  const context = PathProxyEngine.create(obj, {
    ignoreUndefined: true,
    ignoreNull: true,
  });

  const maybeError = validator.hasErrors(
    value,
    decoratorProps as ValidatorOptions,
    context
  );

  return (async ? Promise.resolve(maybeError) : maybeError) as any;
}

export function validateDecorators<
  M extends Model,
  Async extends boolean = false,
>(
  obj: M,
  value: any,
  decorators: DecoratorMetadataAsync[],
  async?: Async
): ConditionalAsync<Async, Record<string, string>> | undefined {
  const result: Record<string, string | Promise<string>> = {};

  for (const decorator of decorators) {
    // skip async decorators if validateDecorators is called synchronously (async = false)
    if (!async && decorator.props.async) continue;

    let err = validateDecorator(obj, value, decorator, async);

    /*
    If the decorator is a list, each element must be checked.
    When 'async' is true, the 'err' will always be a pending promise initially,
    so the '!err' check will evaluate to false (even if the promise later resolves with no errors)
    */
    if ((!err || async) && decorator.key === ValidationKeys.LIST) {
      const values = value instanceof Set ? [...value] : value;
      if (values && values.length > 0) {
        const types =
          decorator.props.class ||
          decorator.props.clazz ||
          decorator.props.customTypes;

        const allowedTypes = [types].flat().map((t) => String(t).toLowerCase());
        const errs = values.map((v: any) => {
          if (Model.isModel(v)) {
            return getNestedValidationErrors(v, obj, async);
          }

          return allowedTypes.includes(typeof v)
            ? undefined
            : "Value has no validatable type";
        });

        if (async) {
          err = Promise.all(errs).then((result) => {
            const allEmpty = result.every((r) => !r);
            return allEmpty ? undefined : result;
          }) as any;
        } else {
          const allEmpty = errs.every((r: string | undefined) => !r);
          err = errs.length > 0 && !allEmpty ? errs : undefined;
        }
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

/**
 * Safely sets temporary metadata on an object
 */
function setTemporaryContext(
  target: any,
  key: symbol | string,
  value: unknown
): void {
  if (!Object.hasOwnProperty.call(target, key)) target[key] = value;
}

/**
 * Safely removes temporary metadata from an object
 */
function cleanupTemporaryContext(target: any, key: symbol | string): void {
  if (Object.hasOwnProperty.call(target, key)) delete target[key];
}

/**
 * @function validate
 * @template M
 * @template Async
 * @memberOf module:decorator-validation
 * @category Model
 *
 * @description
 * Validates the properties of a {@link Model} instance using registered decorators.
 * Supports both synchronous and asynchronous validation flows, depending on the `async` flag.
 *
 * @summary
 * This function inspects a given model object, identifies decorated properties that require validation,
 * and applies the corresponding validation rules. It also supports nested model validation and gracefully
 * merges any validation errors. For collections (Array/Set), it enforces the presence of the `@list` decorator
 * and checks the type of elements. If a property is a nested model, it will call `hasErrors` on it and flatten
 * the nested error keys using dot notation.
 *
 * @param {M} obj - The model instance to be validated. Must extend from {@link Model}.
 * @param {Async} [async] - A flag indicating whether validation should be asynchronous.
 * @param {...string} propsToIgnore - A variadic list of property names that should be skipped during validation.
 *
 * @returns {ConditionalAsync<Async, ModelErrorDefinition | undefined>}
 * Returns either a {@link ModelErrorDefinition} containing validation errors,
 * or `undefined` if no errors are found. When `async` is `true`, returns a Promise.
 *
 * @see {@link Model}
 * @see {@link ModelErrorDefinition}
 * @see {@link validateDecorators}
 * @see {@link getValidatableProperties}
 *
 * @mermaid
 * sequenceDiagram
 *     participant Caller
 *     participant validate
 *     participant getValidatableProperties
 *     participant validateDecorators
 *     participant ModelInstance
 *     Caller->>validate: call with obj, async, propsToIgnore
 *     validate->>getValidatableProperties: retrieve decorated props
 *     loop for each property
 *         validate->>validateDecorators: validate using decorators
 *         alt is nested model
 *             validate->>ModelInstance: call hasErrors()
 *         end
 *     end
 *     alt async
 *         validate->>validate: Promise.allSettled for errors
 *     end
 *     validate-->>Caller: return ModelErrorDefinition | undefined
 */
export function validate<
  M extends Model<boolean>,
  Async extends boolean = false,
>(
  obj: M,
  async: Async,
  ...propsToIgnore: string[]
): ConditionalAsync<Async, ModelErrorDefinition | undefined> {
  const decoratedProperties: ValidationPropertyDecoratorDefinitionAsync[] =
    getValidatableProperties(obj, propsToIgnore);

  const result: Record<string, any> = {};

  const nestedErrors: Record<string, any> = {};
  for (const { prop, decorators } of decoratedProperties) {
    const propKey = String(prop);
    let propValue = (obj as any)[prop];

    if (!decorators?.length) continue;

    // Get the default type validator
    const designTypeDec = decorators.find((d) =>
      [ModelKeys.TYPE, ValidationKeys.TYPE].includes(d.key as any)
    );
    if (!designTypeDec) continue;

    const designType = designTypeDec.props.name;

    // Handle array or Set types and enforce the presence of @list decorator
    if ([Array.name, Set.name].includes(designType)) {
      if (!decorators.some((d) => d.key === ValidationKeys.LIST)) {
        result[propKey] = {
          [ValidationKeys.TYPE]: `Property '${propKey}' requires a @list decorator`,
        };
        continue;
      }

      if (
        propValue &&
        !(Array.isArray(propValue) || propValue instanceof Set)
      ) {
        result[propKey] = {
          [ValidationKeys.TYPE]: `Property '${String(prop)}' must be either an array or a Set`,
        };
        continue;
      }

      // Remove design:type decorator, since @list decorator already ensures type
      for (let i = decorators.length - 1; i >= 0; i--) {
        if (decorators[i].key === ModelKeys.TYPE) {
          decorators.splice(i, 1);
        }
      }
      propValue = propValue instanceof Set ? [...propValue] : propValue;
    }

    const propErrors: Record<string, any> =
      validateDecorators(obj, propValue, decorators, async) || {};

    // Check for nested properties.
    // To prevent unnecessary processing, "propValue" must be defined and validatable
    // let nestedErrors: Record<string, any> = {};
    const isConstr = Model.isPropertyModel(obj, propKey);
    // if propValue !== undefined, null
    if (propValue && isConstr) {
      const instance: Model = propValue;
      const isInvalidModel =
        typeof instance !== "object" ||
        !instance.hasErrors ||
        typeof instance.hasErrors !== "function";

      if (isInvalidModel) {
        // propErrors[ValidationKeys.TYPE] =
        //   "Model should be validatable but it's not.";
        console.warn("Model should be validatable but it's not.");
      } else {
        nestedErrors[propKey] = getNestedValidationErrors(instance, obj, async);
      }
    }

    // Add to the result if we have any errors
    // Async mode returns a Promise that resolves to undefined when no errors exist
    if (Object.keys(propErrors).length > 0 || async)
      result[propKey] = propErrors;

    // Then merge any nested errors
    if (!async) {
      Object.entries(nestedErrors[propKey] || {}).forEach(([key, error]) => {
        if (error !== undefined) {
          result[`${propKey}.${key}`] = error;
        }
      });
    }
  }

  // Synchronous return
  if (!async) {
    return (
      Object.keys(result).length > 0
        ? new ModelErrorDefinition(result)
        : undefined
    ) as any;
  }

  const merged: any = result; // TODO: apply filtering

  const keys = Object.keys(merged);
  const promises = Object.values(merged);
  return Promise.allSettled(promises).then(async (results) => {
    const result: ModelErrors = {};

    for (const [parentProp, nestedErrPromise] of Object.entries(nestedErrors)) {
      const nestedPropDecErrors = (await nestedErrPromise) as Record<
        string,
        any
      >;

      if (nestedPropDecErrors)
        Object.entries(nestedPropDecErrors).forEach(
          ([nestedProp, nestedPropDecError]) => {
            if (nestedPropDecError !== undefined) {
              const nestedKey = [parentProp, nestedProp].join(".");
              result[nestedKey] = nestedPropDecError;
            }
          }
        );
    }

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
