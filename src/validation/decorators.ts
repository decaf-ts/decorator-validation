import "reflect-metadata";
import { ListValidator } from "./Validators/ListValidator";
import { Validation } from "./Validation";
import { ValidationMetadata } from "./types";
import { metadata } from "../reflection/decorators";
import {
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_PATTERNS,
  ValidationKeys,
} from "./Validators/constants";
import { sf } from "../utils/strings";
import { Constructor, ModelConstructor } from "../model/types";
import { PasswordValidator } from "./Validators/PasswordValidator";
import { ValidatorDefinition } from "./Validators/types";
import { Validator } from "./Validators/Validator";
import { parseDate } from "../utils";
import { getValidationKey } from "./utils";

/**
 * @summary Marks the property as required.
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#REQUIRED}
 *
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#REQUIRED}
 *
 * @function required
 *
 * @category Decorators
 */
export function required(message: string = DEFAULT_ERROR_MESSAGES.REQUIRED) {
  return metadata<ValidationMetadata>(
    getValidationKey(ValidationKeys.REQUIRED),
    {
      message: message,
    },
  );
}

/**
 * @summary Defines a minimum value for the property
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#MIN}
 *
 * @param {number | Date} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#MIN}
 *
 * @function min
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function min(
  value: number | Date | string,
  message: string = DEFAULT_ERROR_MESSAGES.MIN,
) {
  return metadata<ValidationMetadata>(getValidationKey(ValidationKeys.MIN), {
    value: value,
    message: message,
    types: [Number.name, Date.name],
  });
}

/**
 * @summary Defines a maximum value for the property
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#MAX}
 *
 * @param {number | Date} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#MAX}
 *
 * @function max
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function max(
  value: number | Date | string,
  message: string = DEFAULT_ERROR_MESSAGES.MAX,
) {
  return metadata<ValidationMetadata>(getValidationKey(ValidationKeys.MAX), {
    value: value,
    message: message,
    types: [Number.name, Date.name],
  });
}

/**
 * @summary Defines a step value for the property
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#STEP}
 *
 * @param {number} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#STEP}
 *
 * @function step
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function step(
  value: number,
  message: string = DEFAULT_ERROR_MESSAGES.STEP,
) {
  return metadata<ValidationMetadata>(getValidationKey(ValidationKeys.STEP), {
    value: value,
    message: message,
    types: [Number.name],
  });
}

/**
 * @summary Defines a minimum length for the property
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#MIN_LENGTH}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#MIN_LENGTH}
 *
 * @function minlength
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function minlength(
  value: number,
  message: string = DEFAULT_ERROR_MESSAGES.MIN_LENGTH,
) {
  return metadata<ValidationMetadata>(
    getValidationKey(ValidationKeys.MIN_LENGTH),
    {
      value: value,
      message: message,
      types: [String.name, Array.name, Set.name],
    },
  );
}

/**
 * @summary Defines a maximum length for the property
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#MAX_LENGTH}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#MAX_LENGTH}
 *
 * @function maxlength
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function maxlength(
  value: number,
  message: string = DEFAULT_ERROR_MESSAGES.MAX_LENGTH,
) {
  return metadata<ValidationMetadata>(
    getValidationKey(ValidationKeys.MAX_LENGTH),
    {
      value: value,
      message: message,
      types: [String.name, Array.name, Set.name],
    },
  );
}

/**
 * @summary Defines a RegExp pattern the property must respect
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#PATTERN}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#PATTERN}
 *
 * @function pattern
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function pattern(
  value: RegExp | string,
  message: string = DEFAULT_ERROR_MESSAGES.PATTERN,
) {
  return metadata<ValidationMetadata>(
    getValidationKey(ValidationKeys.PATTERN),
    {
      value: typeof value === "string" ? value : value.toString(),
      message: message,
      types: [String.name],
    },
  );
}

/**
 * @summary Defines the property as an email
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#EMAIL}
 *
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#EMAIL}
 *
 * @function email
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function email(message: string = DEFAULT_ERROR_MESSAGES.EMAIL) {
  return metadata<ValidationMetadata>(getValidationKey(ValidationKeys.EMAIL), {
    message: message,
    types: [String.name],
  });
}

/**
 * @summary Defines the property as an URL
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#URL}
 *
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#URL}
 *
 * @function url
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function url(message: string = DEFAULT_ERROR_MESSAGES.URL) {
  return metadata<ValidationMetadata>(getValidationKey(ValidationKeys.URL), {
    message: message,
    types: [String.name],
  });
}

/**
 * @summary Enforces type verification
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#TYPE}
 *
 * @param {string[] | string} types accepted types
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#TYPE}
 *
 * @function type
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function type(
  types: string[] | string,
  message: string = DEFAULT_ERROR_MESSAGES.TYPE,
) {
  return metadata<ValidationMetadata>(getValidationKey(ValidationKeys.TYPE), {
    customTypes: types,
    message: message,
  });
}

/**
 * @summary Date Handler Decorator
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#DATE}
 *
 * Will enforce serialization according to the selected format
 *
 * @param {string} format accepted format according to {@link formatDate}
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#DATE}
 * @param {Constructor<Validator>} [validator] the Validator to be used. Defaults to {@link DateValidator}
 *
 * @function date
 *
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function date(
  format: string = "dd/MM/yyyy",
  message: string = DEFAULT_ERROR_MESSAGES.DATE,
) {
  return (target: Record<string, any>, propertyKey: string): any => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.DATE),
      {
        format: format,
        message: message,
        types: [Date.name],
      },
      target,
      propertyKey,
    );

    const values = new WeakMap();

    Object.defineProperty(target, propertyKey, {
      configurable: false,
      set(this: any, newValue: string | Date) {
        const descriptor = Object.getOwnPropertyDescriptor(this, propertyKey);
        if (!descriptor || descriptor.configurable)
          Object.defineProperty(this, propertyKey, {
            enumerable: true,
            configurable: false,
            get: () => values.get(this),
            set: (newValue: string | Date | number) => {
              let val: Date | undefined;
              try {
                val = parseDate(format, newValue);
                values.set(this, val);
              } catch (e: any) {
                console.error(sf("Failed to parse date: {0}", e.message || e));
              }
            },
          });
        this[propertyKey] = newValue;
      },
      get() {
        console.log("here");
      },
    });
  };
}

/**
 * @summary Password Handler Decorator
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#PASSWORD}
 *
 * @param {RegExp} [pattern] defaults to {@link PasswordPatterns#CHAR8_ONE_OF_EACH}
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#PASSWORD}
 * @param {Constructor<Validator>} [validator] Defaults to {@link PasswordValidator}
 *
 * @function password
 *
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function password(
  pattern: RegExp = DEFAULT_PATTERNS.PASSWORD.CHAR8_ONE_OF_EACH,
  message: string = DEFAULT_ERROR_MESSAGES.PASSWORD,
  validator: Constructor<Validator> = PasswordValidator,
) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.PASSWORD),
      {
        pattern: pattern,
        message: message,
        types: [String.name],
      },
      target,
      propertyKey,
    );
    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.PASSWORD,
      save: true,
    } as ValidatorDefinition);
  };
}

/**
 * @summary List Decorator
 * @description Also sets the {@link type} to the provided collection
 *
 * @param {ModelConstructor} clazz
 * @param {string} [collection] The collection being used. defaults to Array
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#LIST}
 * @param {Constructor<Validator>} [validator] defaults to {@link ListValidator}
 *
 * @function list
 *
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function list(
  clazz: ModelConstructor<any>,
  collection: "Array" | "Set" = "Array",
  message: string = DEFAULT_ERROR_MESSAGES.LIST,
  validator: Constructor<Validator> = ListValidator,
) {
  return (target: any, propertyKey: string): any => {
    type(collection)(target, propertyKey);
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.LIST),
      {
        class: clazz.name,
        type: collection,
        message: message,
      },
      target,
      propertyKey,
    );
    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.LIST,
      save: true,
    } as ValidatorDefinition);
  };
}

/**
 * @summary Set Decorator
 * @description Wrapper for {@link list} with the 'Set' Collection
 *
 * @param {ModelConstructor} clazz
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#LIST}
 * @param {Constructor<Validator>} [validator]
 *
 * @function set
 *
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function set(
  clazz: ModelConstructor<any>,
  message: string = DEFAULT_ERROR_MESSAGES.LIST,
  validator?: Constructor<Validator>,
) {
  return (target: any, propertyKey: string): any => {
    list(clazz, "Set", message, validator)(target, propertyKey);
  };
}
