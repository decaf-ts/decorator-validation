import { ModelErrorDefinition } from "./ModelErrorDefinition";
import { ModelKeys } from "../utils/constants";
import { Model } from "./Model";
import { Validation } from "../validation/Validation";
import { ValidationKeys } from "../validation/Validators/constants";
import {
  ModelErrors,
  ValidationPropertyDecoratorDefinition,
  ValidatorOptions,
} from "../validation";
import { PathProxyEngine } from "../utils/PathProxy";
import { ASYNC_META_KEY, VALIDATION_PARENT_KEY } from "../constants";
import { ConditionalAsync, DecoratorMetadataAsync } from "../types";
import { Reflection } from "@decaf-ts/reflection";
import { toConditionalPromise } from "./utils";

/**
 * Retrieves the validation metadata decorators associated with a specific property of a model,
 * using the reflective metadata key.
 *
 * @param model - The model instance or class containing the decorated property.
 * @param {string} prop - The name of the property whose decorators should be retrieved.
 * @param {string} reflectKey - The metadata key used to retrieve the decorators.
 *                     Defaults to `ValidationKeys.REFLECT`.
 *
 * @returns The validation decorators applied to the property
 */
export function getValidationDecorators(
  model: Record<string, any>,
  prop: string,
  reflectKey: string = ValidationKeys.REFLECT
): ValidationPropertyDecoratorDefinition {
  return Reflection.getPropertyDecorators(
    reflectKey,
    model,
    prop
  ) as unknown as ValidationPropertyDecoratorDefinition;
}

/**
 * @description
 * Retrieves all validatable property decorators from a given model, excluding specified properties.
 *
 * @summary
 * Iterates through the own enumerable properties of a model instance, filtering out any properties
 * listed in the `propsToIgnore` array. For each remaining property, it checks whether validation
 * decorators are present using `getValidationDecorators`, and if so, collects them in the result array.
 *
 * @template M - A generic parameter extending the `Model` class, representing the model type being inspected.
 *
 * @param {M} model - An instance of a class extending `Model` from which validatable properties will be extracted.
 * @param {string[]} propsToIgnore - An array of property names that should be excluded from validation inspection.
 *
 * @return {ValidationPropertyDecoratorDefinition[]} An array of validation decorator definitions
 * associated with the model's properties, excluding those listed in `propsToIgnore`.
 *
 * @function getValidatableProperties
 */
export function getValidatableProperties<M extends Model>(
  model: M,
  propsToIgnore: string[]
): ValidationPropertyDecoratorDefinition[] {
  const decoratedProperties: ValidationPropertyDecoratorDefinition[] = [];

  for (const prop in model) {
    if (
      Object.prototype.hasOwnProperty.call(model, prop) &&
      !propsToIgnore.includes(prop)
    ) {
      const dec = getValidationDecorators(model, prop);
      if (dec) decoratedProperties.push(dec);
    }
  }

  return decoratedProperties;
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
 * Executes validation with temporary context and returns the validation result
 *
 * @param nestedModel - The instance to validate
 * @param parentModel - Reference to a parent object for nested validation
 * @param isAsync - Whether to perform async validation
 * @returns Validation result from hasErrors()
 */
function getNestedValidationErrors<
  M extends Model,
  Async extends boolean = false,
>(
  nestedModel: M,
  parentModel?: M,
  isAsync?: Async
): ConditionalAsync<Async, ModelErrorDefinition | undefined> {
  // Set temporary context for nested models
  if (parentModel) {
    setTemporaryContext(nestedModel, VALIDATION_PARENT_KEY, parentModel);
  }
  setTemporaryContext(nestedModel, ASYNC_META_KEY, !!isAsync);

  const errs = nestedModel.hasErrors();
  cleanupTemporaryContext(nestedModel, VALIDATION_PARENT_KEY);
  cleanupTemporaryContext(nestedModel, ASYNC_META_KEY);
  return errs as any;
}

export function validateChildValue<M extends Model>(
  prop: string,
  childValue: any,
  parentModel: M,
  allowedTypes: string[],
  async: boolean
):
  | string
  | undefined
  | ModelErrorDefinition
  | Promise<string | undefined | ModelErrorDefinition> {
  let err:
    | ModelErrorDefinition
    | string
    | undefined
    | Promise<string | undefined | ModelErrorDefinition> = undefined;
  let atLeastOneMatched = false;
  for (const allowedType of allowedTypes) {
    const Constr = Model.get(allowedType) as any;
    if (!Constr) {
      err = new ModelErrorDefinition({
        [prop]: {
          [ValidationKeys.TYPE]: `Unable to verify type consistency, missing model registry for ${allowedType}`,
        },
      });
    }

    if (childValue instanceof Constr) {
      atLeastOneMatched = true;
      err = getNestedValidationErrors(childValue, parentModel, async);
      break;
    }
  }

  if (atLeastOneMatched) return err;

  return (
    err ||
    new ModelErrorDefinition({
      [prop]: {
        [ValidationKeys.TYPE]: `Value must be an instance of one of the expected types: ${allowedTypes.join(", ")}`,
      },
    })
  );
}

export function validateDecorator<
  M extends Model,
  Async extends boolean = false,
>(
  model: M,
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

  const context = PathProxyEngine.create(model, {
    ignoreUndefined: true,
    ignoreNull: true,
  });

  const maybeAsyncErrors = validator.hasErrors(
    value,
    decorator.key === ModelKeys.TYPE
      ? ({ types: (decoratorProps as any)[0].name } as any)
      : (decoratorProps as ValidatorOptions),
    context
  );

  return toConditionalPromise(maybeAsyncErrors, async);
}

/**
 * @description
 * Executes validation logic for a set of decorators applied to a model's property, handling both
 * synchronous and asynchronous validations, including support for nested validations and lists.
 *
 * @summary
 * Iterates over an array of decorator metadata objects and applies each validation rule to the
 * provided value. For list decorators (`ValidationKeys.LIST`), it performs element-wise validation,
 * supporting nested model validation and type checks. If the `async` flag is set, asynchronous
 * validation is supported using `Promise.all`. The result is a record mapping validation keys to
 * error messages, or `undefined` if no errors are found.
 *
 * @template M - A type parameter extending `Model`, representing the model type being validated.
 * @template Async - A boolean indicating whether validation should be performed asynchronously.
 *
 * @param {M} model - The model instance that the validation is associated with.
 * @param {string} prop - The model field name
 * @param {any} value - The value to be validated against the provided decorators.
 * @param {DecoratorMetadataAsync[]} decorators - An array of metadata objects representing validation decorators.
 * @param {Async} [async] - Optional flag indicating whether validation should be performed asynchronously.
 *
 * @return {ConditionalAsync<Async, Record<string, string>> | undefined}
 * Returns either a record of validation errors (keyed by the decorator key) or `undefined` if no errors are found.
 * If `async` is true, the return value is a Promise resolving to the same structure.
 *
 * @function validateDecorators
 */
export function validateDecorators<
  M extends Model,
  Async extends boolean = false,
>(
  model: M,
  prop: string,
  value: any,
  decorators: DecoratorMetadataAsync[],
  async?: Async
): ConditionalAsync<Async, Record<string, string> | undefined> {
  const result: Record<string, string | Promise<string>> = {};

  for (const decorator of decorators) {
    // skip async decorators if validateDecorators is called synchronously (async = false)
    if (!async && decorator.props.async) continue;

    let validationErrors = validateDecorator(model, value, decorator, async);

    /*
    If the decorator is a list, each element must be checked.
    When 'async' is true, the 'err' will always be a pending promise initially,
    so the '!err' check will evaluate to false (even if the promise later resolves with no errors)
    */
    if (decorator.key === ValidationKeys.LIST && (!validationErrors || async)) {
      const values = value instanceof Set ? [...value] : value;
      if (values && values.length > 0) {
        let types: string[] = (decorator.props.class ||
          decorator.props.clazz ||
          decorator.props.customTypes) as string[];
        types = (Array.isArray(types) ? types : [types]).map((e: any) => {
          e = typeof e === "function" && !e.name ? e() : e;
          return (e as any).name ? (e as any).name : e;
        }) as string[];
        const allowedTypes = [types].flat().map((t) => String(t).toLowerCase());
        // const reserved = Object.values(ReservedModels).map((v) => v.toLowerCase()) as string[];

        const errs = values.map((childValue: any) => {
          // if (Model.isModel(v) && !reserved.includes(v) {
          if (Model.isModel(childValue)) {
            return validateChildValue(
              prop,
              childValue,
              model,
              types.flat(),
              !!async
            );
            // return getNestedValidationErrors(childValue, model, async);
          }

          return allowedTypes.includes(typeof childValue)
            ? undefined
            : "Value has no validatable type";
        });

        if (async) {
          validationErrors = Promise.all(errs).then((result) => {
            const allEmpty = result.every((r) => !r);
            return allEmpty ? undefined : result;
          }) as any;
        } else {
          const allEmpty = errs.every((r: string | undefined) => !r);
          validationErrors = errs.length > 0 && !allEmpty ? errs : undefined;
        }
      }
    }

    if (validationErrors) (result as any)[decorator.key] = validationErrors;
  }

  if (!async)
    return Object.keys(result).length > 0
      ? (result as any)
      : (undefined as any);

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
 * @param {M} model - The model instance to be validated. Must extend from {@link Model}.
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
  model: M,
  async: Async,
  ...propsToIgnore: string[]
): ConditionalAsync<Async, ModelErrorDefinition | undefined> {
  const decoratedProperties: ValidationPropertyDecoratorDefinition[] =
    getValidatableProperties(model, propsToIgnore);

  const result: Record<string, any> = {};
  const nestedErrors: Record<string, any> = {};

  for (const { prop, decorators } of decoratedProperties) {
    const propKey = String(prop);
    let propValue = (model as any)[prop];

    if (!decorators?.length) continue;

    // Get the default type validator
    const priority = [ValidationKeys.TYPE, ModelKeys.TYPE];
    const designTypeDec = priority
      .map((key) => decorators.find((d) => d.key === key))
      .find(Boolean);

    // Ensures that only one type decorator remains.
    if (designTypeDec?.key === ValidationKeys.TYPE) {
      decorators.splice(
        0,
        decorators.length,
        ...decorators.filter((d) => d.key !== ModelKeys.TYPE)
      );
    }

    if (!designTypeDec) continue;

    const designType =
      designTypeDec.props.class ||
      designTypeDec.props.clazz ||
      designTypeDec.props.customTypes ||
      designTypeDec.props.name;

    const designTypes = (
      Array.isArray(designType) ? designType : [designType]
    ).map((e: any) => {
      e = typeof e === "function" && !e.name ? e() : e;
      return (e as any).name ? (e as any).name : e;
    }) as string[];

    // Handle array or Set types and enforce the presence of @list decorator
    // if ([Array.name, Set.name].includes(designType)) {}
    if (designTypes.some((t) => [Array.name, Set.name].includes(t))) {
      if (!decorators.some((d) => d.key === ValidationKeys.LIST)) {
        result[propKey] = {
          [ValidationKeys.TYPE]: `Array or Set property '${propKey}' requires a @list decorator`,
        };
        continue;
      }

      if (
        propValue &&
        !(Array.isArray(propValue) || propValue instanceof Set)
      ) {
        result[propKey] = {
          [ValidationKeys.TYPE]: `Property '${String(prop)}' must be either an Array or a Set`,
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
      validateDecorators(model, propKey, propValue, decorators, async) || {};

    // Check for nested properties.
    // To prevent unnecessary processing, "propValue" must be defined and validatable
    // let nestedErrors: Record<string, any> = {};
    const isConstr = Model.isPropertyModel(model, propKey);
    const hasPropValue = propValue !== null && propValue !== undefined;
    if (isConstr && hasPropValue) {
      const instance = propValue as Model;
      const isInvalidModel =
        typeof instance !== "object" ||
        typeof instance.hasErrors !== "function";

      if (isInvalidModel) {
        // propErrors[ValidationKeys.TYPE] = "Model should be validatable but it's not.";
        console.warn("Model should be validatable but it's not.");
      } else {
        const Constr = Model.get(designType) as any;

        // Ensure instance is of the expected model class.
        if (!Constr || !(instance instanceof Constr)) {
          propErrors[ValidationKeys.TYPE] = !Constr
            ? `Unable to verify type consistency, missing model registry for ${designTypes.toString()} on prop ${propKey}`
            : `Value must be an instance of ${Constr.name}`;
        } else {
          nestedErrors[propKey] = getNestedValidationErrors(
            instance,
            model,
            async
          );
        }
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
