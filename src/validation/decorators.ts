import "reflect-metadata";
import { ValidationMetadata } from "./types";
import {
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_PATTERNS,
  ValidationKeys,
} from "./Validators/constants";
import { sf } from "../utils/strings";
import { ModelConstructor } from "../model/types";
import { parseDate } from "../utils/dates";
import { propMetadata } from "../utils/decorators";
import { Validation } from "./Validation";
import { Decoration } from "../utils/Decoration";

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
  const key = Validation.key(ValidationKeys.REQUIRED);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(key, {
        message: message,
      })
    )
    .apply();
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
  message: string = DEFAULT_ERROR_MESSAGES.MIN
) {
  const key = Validation.key(ValidationKeys.MIN);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(Validation.key(ValidationKeys.MIN), {
        [ValidationKeys.MIN]: value,
        message: message,
        types: [Number.name, Date.name],
      })
    )
    .apply();
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
  message: string = DEFAULT_ERROR_MESSAGES.MAX
) {
  const key = Validation.key(ValidationKeys.MAX);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(key, {
        [ValidationKeys.MAX]: value,
        message: message,
        types: [Number.name, Date.name],
      })
    )
    .apply();
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
  message: string = DEFAULT_ERROR_MESSAGES.STEP
) {
  const key = Validation.key(ValidationKeys.STEP);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(key, {
        [ValidationKeys.STEP]: value,
        message: message,
        types: [Number.name],
      })
    )
    .apply();
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
  message: string = DEFAULT_ERROR_MESSAGES.MIN_LENGTH
) {
  const key = Validation.key(ValidationKeys.MIN_LENGTH);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(key, {
        [ValidationKeys.MIN_LENGTH]: value,
        message: message,
        types: [String.name, Array.name, Set.name],
      })
    )
    .apply();
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
  message: string = DEFAULT_ERROR_MESSAGES.MAX_LENGTH
) {
  const key = Validation.key(ValidationKeys.MAX_LENGTH);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(key, {
        [ValidationKeys.MAX_LENGTH]: value,
        message: message,
        types: [String.name, Array.name, Set.name],
      })
    )
    .apply();
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
  message: string = DEFAULT_ERROR_MESSAGES.PATTERN
) {
  const key = Validation.key(ValidationKeys.PATTERN);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(Validation.key(ValidationKeys.PATTERN), {
        [ValidationKeys.PATTERN]:
          typeof value === "string" ? value : value.toString(),
        message: message,
        types: [String.name],
      })
    )
    .apply();
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
  const key = Validation.key(ValidationKeys.EMAIL);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(Validation.key(ValidationKeys.EMAIL), {
        [ValidationKeys.PATTERN]: DEFAULT_PATTERNS.EMAIL,
        message: message,
        types: [String.name],
      })
    )
    .apply();
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
  const key = Validation.key(ValidationKeys.URL);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(Validation.key(ValidationKeys.URL), {
        [ValidationKeys.PATTERN]: DEFAULT_PATTERNS.URL,
        message: message,
        types: [String.name],
      })
    )
    .apply();
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
  message: string = DEFAULT_ERROR_MESSAGES.TYPE
) {
  const key = Validation.key(ValidationKeys.TYPE);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(Validation.key(ValidationKeys.TYPE), {
        customTypes: types,
        message: message,
      })
    )
    .apply();
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
  message: string = DEFAULT_ERROR_MESSAGES.DATE
) {
  const key = Validation.key(ValidationKeys.DATE);
  const dateDec = (target: Record<string, any>, propertyKey?: any): any => {
    propMetadata(key, {
      [ValidationKeys.FORMAT]: format,
      message: message,
      types: [Date.name],
    })(target, propertyKey);

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
  return Decoration.for(key).define(dateDec).apply();
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
  message: string = DEFAULT_ERROR_MESSAGES.PASSWORD
) {
  const key = Validation.key(ValidationKeys.PASSWORD);
  return Decoration.for(key)
    .define(
      propMetadata(key, {
        [ValidationKeys.PATTERN]: pattern,
        message: message,
        types: [String.name],
      })
    )
    .apply();
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
  clazz: ModelConstructor<any> | ModelConstructor<any>[],
  collection: "Array" | "Set" = "Array",
  message: string = DEFAULT_ERROR_MESSAGES.LIST
) {
  const key = Validation.key(ValidationKeys.LIST);
  return Decoration.for(key)
    .define(
      propMetadata(key, {
        clazz: Array.isArray(clazz) ? clazz.map((c) => c.name) : [clazz.name],
        type: collection,
        message: message,
      })
    )
    .apply();
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
  message: string = DEFAULT_ERROR_MESSAGES.LIST
) {
  return list(clazz, "Set", message);
}
