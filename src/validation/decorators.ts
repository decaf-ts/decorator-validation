import "reflect-metadata";
import {
  DiffValidatorOptions,
  EqualsValidatorOptions,
  GreaterThanOrEqualValidatorOptions,
  GreaterThanValidatorOptions,
  LessThanOrEqualValidatorOptions,
  LessThanValidatorOptions,
  ValidationMetadata,
} from "./types";
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
 * @description Property decorator that marks a field as required
 * @summary Marks the property as required, causing validation to fail if the property is undefined, null, or empty.
 * Validators to validate a decorated property must use key {@link ValidationKeys#REQUIRED}.
 * This decorator is commonly used as the first validation step for important fields.
 *
 * @param {string} [message] - The error message to display when validation fails. Defaults to {@link DEFAULT_ERROR_MESSAGES#REQUIRED}
 * @return {PropertyDecorator} A decorator function that can be applied to class properties
 *
 * @function required
 * @category Property Decorators
 *
 * @example
 * ```typescript
 * class User {
 *   @required()
 *   username: string;
 *
 *   @required("Email address is mandatory")
 *   email: string;
 * }
 * ```
 */
export function required(message: string = DEFAULT_ERROR_MESSAGES.REQUIRED) {
  const key = Validation.key(ValidationKeys.REQUIRED);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(key, {
        message: message,
        async: false,
      })
    )
    .apply();
}

/**
 * @description Property decorator that enforces a minimum value constraint
 * @summary Defines a minimum value for the property, causing validation to fail if the property value is less than the specified minimum.
 * Validators to validate a decorated property must use key {@link ValidationKeys#MIN}.
 * This decorator works with numeric values and dates.
 *
 * @param {number | Date | string} value - The minimum value allowed. For dates, can be a Date object or a string that can be converted to a date
 * @param {string} [message] - The error message to display when validation fails. Defaults to {@link DEFAULT_ERROR_MESSAGES#MIN}
 * @return {PropertyDecorator} A decorator function that can be applied to class properties
 *
 * @function min
 * @category Property Decorators
 *
 * @example
 * ```typescript
 * class Product {
 *   @min(0)
 *   price: number;
 *
 *   @min(new Date(2023, 0, 1), "Date must be after January 1, 2023")
 *   releaseDate: Date;
 * }
 * ```
 */
export function min(
  value: number | Date | string,
  message: string = DEFAULT_ERROR_MESSAGES.MIN
) {
  const key = Validation.key(ValidationKeys.MIN);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(key, {
        [ValidationKeys.MIN]: value,
        message: message,
        types: [Number.name, Date.name],
        async: false,
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
 * @category Property Decorators
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
        async: false,
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
 * @category Property Decorators
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
        async: false,
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
 * @category Property Decorators
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
        async: false,
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
 * @category Property Decorators
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
        async: false,
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
 * @category Property Decorators
 */
export function pattern(
  value: RegExp | string,
  message: string = DEFAULT_ERROR_MESSAGES.PATTERN
) {
  const key = Validation.key(ValidationKeys.PATTERN);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(key, {
        [ValidationKeys.PATTERN]:
          typeof value === "string" ? value : value.toString(),
        message: message,
        types: [String.name],
        async: false,
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
 * @category Property Decorators
 */
export function email(message: string = DEFAULT_ERROR_MESSAGES.EMAIL) {
  const key = Validation.key(ValidationKeys.EMAIL);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(key, {
        [ValidationKeys.PATTERN]: DEFAULT_PATTERNS.EMAIL,
        message: message,
        types: [String.name],
        async: false,
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
 * @category Property Decorators
 */
export function url(message: string = DEFAULT_ERROR_MESSAGES.URL) {
  const key = Validation.key(ValidationKeys.URL);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(key, {
        [ValidationKeys.PATTERN]: DEFAULT_PATTERNS.URL,
        message: message,
        types: [String.name],
        async: false,
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
 * @category Property Decorators
 */
export function type(
  types: string[] | string,
  message: string = DEFAULT_ERROR_MESSAGES.TYPE
) {
  const key = Validation.key(ValidationKeys.TYPE);
  return Decoration.for(key)
    .define(
      propMetadata<ValidationMetadata>(key, {
        customTypes: types,
        message: message,
        async: false,
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
 *
 * @function date
 *
 * @category Property Decorators
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
 * @param {RegExp} [pattern] defaults to {@link DEFAULT_PATTERNS#CHAR8_ONE_OF_EACH}
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#PASSWORD}
 *
 * @function password
 *
 * @category Property Decorators
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
 *
 * @function list
 *
 * @category Property Decorators
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
 *
 * @function set
 *
 * @category Property Decorators
 */
export function set(
  clazz: ModelConstructor<any>,
  message: string = DEFAULT_ERROR_MESSAGES.LIST
) {
  return list(clazz, "Set", message);
}

/**
 * @summary Declares that the decorated property must be equal to another specified property.
 * @description Applies the {@link ValidationKeys.EQUALS} validator to ensure the decorated value matches the value of the given property.
 *
 * @param {string} propertyToCompare - The name of the property to compare equality against.
 * @param {string} [message=DEFAULT_ERROR_MESSAGES.EQUALS] - Custom error message to return if validation fails.
 *
 * @returns {PropertyDecorator} A property decorator used to register the equality validation metadata.
 *
 * @function eq
 * @category Property Decorators
 */
export function eq(
  propertyToCompare: string,
  message: string = DEFAULT_ERROR_MESSAGES.EQUALS
) {
  const options: EqualsValidatorOptions = {
    message: message,
    async: false,
    [ValidationKeys.EQUALS]: propertyToCompare,
  };

  return propMetadata<ValidationMetadata>(
    Validation.key(ValidationKeys.EQUALS),
    options as ValidationMetadata
  );
}

/**
 * @summary Declares that the decorated property must be different from another specified property.
 * @description Applies the {@link ValidationKeys.DIFF} validator to ensure the decorated value is different from the value of the given property.
 *
 * @param {string} propertyToCompare - The name of the property to compare difference against.
 * @param {string} [message=DEFAULT_ERROR_MESSAGES.DIFF] - Custom error message to return if validation fails.
 *
 * @returns {PropertyDecorator} A property decorator used to register the difference validation metadata.
 *
 * @function diff
 * @category Property Decorators
 */
export function diff(
  propertyToCompare: string,
  message: string = DEFAULT_ERROR_MESSAGES.DIFF
) {
  const options: DiffValidatorOptions = {
    message: message,
    async: false,
    [ValidationKeys.DIFF]: propertyToCompare,
  };

  return propMetadata<ValidationMetadata>(
    Validation.key(ValidationKeys.DIFF),
    options as ValidationMetadata
  );
}

/**
 * @summary Declares that the decorated property must be less than another specified property.
 * @description Applies the {@link ValidationKeys.LESS_THAN} validator to ensure the decorated value is less than the value of the given property.
 *
 * @param {string} propertyToCompare - The name of the property to compare against.
 * @param {string} [message=DEFAULT_ERROR_MESSAGES.LESS_THAN] - Custom error message to return if validation fails.
 *
 * @returns {PropertyDecorator} A property decorator used to register the less than validation metadata.
 *
 * @function lt
 * @category Property Decorators
 */
export function lt(
  propertyToCompare: string,
  message: string = DEFAULT_ERROR_MESSAGES.LESS_THAN
) {
  const options: LessThanValidatorOptions = {
    message: message,
    async: false,
    [ValidationKeys.LESS_THAN]: propertyToCompare,
  };

  return propMetadata<ValidationMetadata>(
    Validation.key(ValidationKeys.LESS_THAN),
    options as ValidationMetadata
  );
}

/**
 * @summary Declares that the decorated property must be equal or less than another specified property.
 * @description Applies the {@link ValidationKeys.LESS_THAN_OR_EQUAL} validator to ensure the decorated value is equal or less than the value of the given property.
 *
 * @param {string} propertyToCompare - The name of the property to compare against.
 * @param {string} [message=DEFAULT_ERROR_MESSAGES.LESS_THAN_OR_EQUAL] - Custom error message to return if validation fails.
 *
 * @returns {PropertyDecorator} A property decorator used to register the less than or equal validation metadata.
 *
 * @function lte
 * @category Property Decorators
 */
export function lte(
  propertyToCompare: string,
  message: string = DEFAULT_ERROR_MESSAGES.LESS_THAN_OR_EQUAL
) {
  const options: LessThanOrEqualValidatorOptions = {
    message: message,
    async: false,
    [ValidationKeys.LESS_THAN_OR_EQUAL]: propertyToCompare,
  };

  return propMetadata<ValidationMetadata>(
    Validation.key(ValidationKeys.LESS_THAN_OR_EQUAL),
    options as ValidationMetadata
  );
}

/**
 * @summary Declares that the decorated property must be greater than another specified property.
 * @description Applies the {@link ValidationKeys.GREATER_THAN} validator to ensure the decorated value is greater than the value of the given property.
 *
 * @param {string} propertyToCompare - The name of the property to compare against.
 * @param {string} [message=DEFAULT_ERROR_MESSAGES.GREATER_THAN] - Custom error message to return if validation fails.
 *
 * @returns {PropertyDecorator} A property decorator used to register the greater than validation metadata.
 *
 * @function gt
 * @category Property Decorators
 */
export function gt(
  propertyToCompare: string,
  message: string = DEFAULT_ERROR_MESSAGES.GREATER_THAN
) {
  const options: GreaterThanValidatorOptions = {
    message: message,
    async: false,
    [ValidationKeys.GREATER_THAN]: propertyToCompare,
  };

  return propMetadata<ValidationMetadata>(
    Validation.key(ValidationKeys.GREATER_THAN),
    options as ValidationMetadata
  );
}

/**
 * @summary Declares that the decorated property must be equal or greater than another specified property.
 * @description Applies the {@link ValidationKeys.GREATER_THAN_OR_EQUAL} validator to ensure the decorated value is equal or greater than the value of the given property.
 *
 * @param {string} propertyToCompare - The name of the property to compare against.
 * @param {string} [message=DEFAULT_ERROR_MESSAGES.GREATER_THAN_OR_EQUAL] - Custom error message to return if validation fails.
 *
 * @returns {PropertyDecorator} A property decorator used to register the greater than or equal validation metadata.
 *
 * @function gte
 * @category Property Decorators
 */
export function gte(
  propertyToCompare: string,
  message: string = DEFAULT_ERROR_MESSAGES.GREATER_THAN_OR_EQUAL
) {
  const options: GreaterThanOrEqualValidatorOptions = {
    message: message,
    async: false,
    [ValidationKeys.GREATER_THAN_OR_EQUAL]: propertyToCompare,
  };

  return propMetadata<ValidationMetadata>(
    Validation.key(ValidationKeys.GREATER_THAN_OR_EQUAL),
    options as ValidationMetadata
  );
}
