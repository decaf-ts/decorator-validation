import "reflect-metadata";
import { ListValidator } from "./Validators/ListValidator";
import { Validation } from "./Validation";
import { ValidationMetadata } from "./types";
import { metadata } from "../reflection/decorators";
import { DateValidator } from "./Validators/DateValidator";
import { MaxValidator } from "./Validators/MaxValidator";
import { MaxLengthValidator } from "./Validators/MaxLengthValidator";
import { EmailValidator } from "./Validators/EmailValidator";
import { StepValidator } from "./Validators/StepValidator";
import {
  DAYS_OF_WEEK_NAMES,
  DEFAULT_ERROR_MESSAGES,
  MONTH_NAMES,
  PasswordPatterns,
  ValidationKeys,
} from "./Validators/constants";
import { TypeValidator } from "./Validators/TypeValidator";
import { dateFromFormat } from "../utils/dates";
import { sf } from "../utils/strings";
import { Constructor, ModelConstructor } from "../model/types";
import { URLValidator } from "./Validators/URLValidator";
import { MinValidator } from "./Validators/MinValidator";
import { PasswordValidator } from "./Validators/PasswordValidator";
import { ValidatorDefinition } from "./Validators/types";
import { MinLengthValidator } from "./Validators/MinLengthValidator";
import { PatternValidator } from "./Validators/PatternValidator";
import { Validator } from "./Validators/Validator";

/**
 * @summary Builds the key to store as Metadata under Reflections
 * @description concatenates {@link ValidationKeys#REFLECT} with the provided key
 *
 * @param {string} key
 *
 * @function getModelKey
 * @memberOf module:decorator-validation.Utils
 * @category Utilities
 */
export function getValidationKey(key: string) {
  return ValidationKeys.REFLECT + key;
}

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
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.REQUIRED),
      {
        message: message,
      },
      target,
      propertyKey,
    );
  };
}

/**
 * @summary Defines a minimum value for the property
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#MIN}
 *
 * @param {number | Date} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#MIN}
 * @param {Constructor<Validator>} [validator] the Validator to be used. Defaults to {@link MinValidator}
 *
 * @function min
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function min(
  value: number | Date | string,
  message: string = DEFAULT_ERROR_MESSAGES.MIN,
  validator: Constructor<Validator> = MinValidator,
) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.MIN),
      {
        value: value,
        message: message,
        types: [Number.name, Date.name],
      },
      target,
      propertyKey,
    );
    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.MIN,
      save: true,
    } as ValidatorDefinition);
  };
}

/**
 * @summary Defines a maximum value for the property
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#MAX}
 *
 * @param {number | Date} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#MAX}
 * @param {Constructor<Validator>} [validator] the Validator to be used. Defaults to {@link MaxValidator}
 *
 * @function max
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function max(
  value: number | Date | string,
  message: string = DEFAULT_ERROR_MESSAGES.MAX,
  validator: Constructor<Validator> = MaxValidator,
) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.MAX),
      {
        value: value,
        message: message,
        types: [Number.name, Date.name],
      },
      target,
      propertyKey,
    );

    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.MAX,
      save: true,
    } as ValidatorDefinition);
  };
}

/**
 * @summary Defines a step value for the property
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#STEP}
 *
 * @param {number} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#STEP}
 * @param {Constructor<Validator>} [validator] the Validator to be used. Defaults to {@link StepValidator}
 *
 * @function step
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function step(
  value: number,
  message: string = DEFAULT_ERROR_MESSAGES.STEP,
  validator: Constructor<Validator> = StepValidator,
) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.STEP),
      {
        value: value,
        message: message,
        types: [Number.name],
      },
      target,
      propertyKey,
    );

    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.STEP,
      save: true,
    } as ValidatorDefinition);
  };
}

/**
 * @summary Defines a minimum length for the property
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#MIN_LENGTH}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#MIN_LENGTH}
 * @param {Constructor<Validator>} [validator] the Validator to be used. Defaults to {@link MinLengthValidator}
 *
 * @function minlength
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function minlength(
  value: number,
  message: string = DEFAULT_ERROR_MESSAGES.MIN_LENGTH,
  validator: Constructor<Validator> = MinLengthValidator,
) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.MIN_LENGTH),
      {
        value: value,
        message: message,
        types: [String.name, Array.name, Set.name],
      },
      target,
      propertyKey,
    );
    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.MIN_LENGTH,
      save: true,
    } as ValidatorDefinition);
  };
}

/**
 * @summary Defines a maximum length for the property
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#MAX_LENGTH}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#MAX_LENGTH}
 * @param {Constructor<Validator>} [validator] the Validator to be used. Defaults to {@link MaxLengthValidator}
 *
 * @function maxlength
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function maxlength(
  value: number,
  message: string = DEFAULT_ERROR_MESSAGES.MAX_LENGTH,
  validator: Constructor<Validator> = MaxLengthValidator,
) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.MAX_LENGTH),
      {
        value: value,
        message: message,
        types: [String.name, Array.name, Set.name],
      },
      target,
      propertyKey,
    );
    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.MAX_LENGTH,
      save: true,
    } as ValidatorDefinition);
  };
}

/**
 * @summary Defines a RegExp pattern the property must respect
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#PATTERN}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#PATTERN}
 * @param {Constructor<Validator>} [validator] the Validator to be used. Defaults to {@link PatternValidator}
 *
 * @function pattern
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function pattern(
  value: RegExp | string,
  message: string = DEFAULT_ERROR_MESSAGES.PATTERN,
  validator: Constructor<Validator> = PatternValidator,
) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.PATTERN),
      {
        value: typeof value === "string" ? value : value.toString(),
        message: message,
        types: [String.name],
      },
      target,
      propertyKey,
    );
    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.PATTERN,
      save: true,
    } as ValidatorDefinition);
  };
}

/**
 * @summary Defines the property as an email
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#EMAIL}
 *
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#EMAIL}
 * @param {Constructor<Validator>} [validator] the Validator to be used. Defaults to {@link EmailValidator}
 *
 * @function email
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function email(
  message: string = DEFAULT_ERROR_MESSAGES.EMAIL,
  validator: Constructor<Validator> = EmailValidator,
) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.EMAIL),
      {
        message: message,
        types: [String.name],
      },
      target,
      propertyKey,
    );
    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.EMAIL,
      save: true,
    } as ValidatorDefinition);
  };
}

/**
 * @summary Defines the property as an URL
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#URL}
 *
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#URL}
 * @param {Constructor<Validator>} [validator] the Validator to be used. Defaults to {@link URLValidator}
 *
 * @function url
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function url(
  message: string = DEFAULT_ERROR_MESSAGES.URL,
  validator: Constructor<Validator> = URLValidator,
) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.URL),
      {
        message: message,
        types: [String.name],
      },
      target,
      propertyKey,
    );
    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.URL,
      save: true,
    } as ValidatorDefinition);
  };
}

/**
 * @summary Enforces type verification
 * @description Validators to validate a decorated property must use key {@link ValidationKeys#TYPE}
 *
 * @param {string[] | string} types accepted types
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#TYPE}
 * @param {Constructor<Validator>} [validator] the Validator to be used. Defaults to {@link TypeValidator}
 *
 * @function type
 * @memberOf module:decorator-validation.Decorators.Validation
 * @category Decorators
 */
export function type(
  types: string[] | string,
  message: string = DEFAULT_ERROR_MESSAGES.TYPE,
  validator: Constructor<Validator> = TypeValidator,
) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
      getValidationKey(ValidationKeys.TYPE),
      {
        customTypes: types,
        message: message,
      },
      target,
      propertyKey,
    );
    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.TYPE,
      save: true,
    } as ValidatorDefinition);
  };
}

/**
 * @summary Binds a date format to a string
 * @param {Date} [date]
 * @param {string} [format]
 * @memberOf module:decorator-validation.Utils.Format
 * @category Utilities
 */
export function bindDateToString(date: Date | undefined, format: string) {
  if (!date) return;
  const func = () => formatDate(date, format);
  Object.defineProperty(date, "toISOString", {
    enumerable: false,
    configurable: false,
    value: func,
  });
  Object.defineProperty(date, "toString", {
    enumerable: false,
    configurable: false,
    value: func,
  });

  return date;
}

/**
 * @summary Helper function to be used instead of instanceOf Date
 * @param date
 * @memberOf module:decorator-validation.Utils.Dates
 * @category Validation
 */
export function isValidDate(date: any): boolean {
  return (
    date &&
    Object.prototype.toString.call(date) === "[object Date]" &&
    !isNaN(date)
  );
}

/**
 * @summary Util function to pad numbers
 * @param {number} num
 *
 * @return {string}
 *
 * @function twoDigitPad
 * @memberOf module:decorator-validation.Utils.Format
 * @category Format
 */
export function twoDigitPad(num: number): string {
  return num < 10 ? "0" + num : num.toString();
}

/**
 * @summary Date Format Handling
 * @description Code from {@link https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date}
 *
 * <pre>
 *      Using similar formatting as Moment.js, Class DateTimeFormatter (Java), and Class SimpleDateFormat (Java),
 *      I implemented a comprehensive solution formatDate(date, patternStr) where the code is easy to read and modify.
 *      You can display date, time, AM/PM, etc.
 *
 *      Date and Time Patterns
 *      yy = 2-digit year; yyyy = full year
 *      M = digit month; MM = 2-digit month; MMM = short month name; MMMM = full month name
 *      EEEE = full weekday name; EEE = short weekday name
 *      d = digit day; dd = 2-digit day
 *      h = hours am/pm; hh = 2-digit hours am/pm; H = hours; HH = 2-digit hours
 *      m = minutes; mm = 2-digit minutes; aaa = AM/PM
 *      s = seconds; ss = 2-digit seconds
 *      S = miliseconds
 * </pre>
 *
 * @param {Date} date
 * @param {string} [patternStr] defaults to 'yyyy/MM/dd'
 * @return {string} the formatted date
 *
 * @function formatDate
 * @memberOf module:decorator-validation.Utils.Dates
 * @category Format
 */
export function formatDate(date: Date, patternStr: string = "yyyy/MM/dd") {
  const day: number = date.getDate(),
    month: number = date.getMonth(),
    year: number = date.getFullYear(),
    hour: number = date.getHours(),
    minute: number = date.getMinutes(),
    second: number = date.getSeconds(),
    miliseconds: number = date.getMilliseconds(),
    h: number = hour % 12,
    hh: string = twoDigitPad(h),
    HH: string = twoDigitPad(hour),
    mm: string = twoDigitPad(minute),
    ss: string = twoDigitPad(second),
    aaa: string = hour < 12 ? "AM" : "PM",
    EEEE: string = DAYS_OF_WEEK_NAMES[date.getDay()],
    EEE: string = EEEE.substr(0, 3),
    dd: string = twoDigitPad(day),
    M: number = month + 1,
    MM: string = twoDigitPad(M),
    MMMM: string = MONTH_NAMES[month],
    MMM: string = MMMM.substr(0, 3),
    yyyy: string = year + "",
    yy: string = yyyy.substr(2, 2);
  // checks to see if month name will be used
  patternStr = patternStr
    .replace("hh", hh)
    .replace("h", h.toString())
    .replace("HH", HH)
    .replace("H", hour.toString())
    .replace("mm", mm)
    .replace("m", minute.toString())
    .replace("ss", ss)
    .replace("s", second.toString())
    .replace("S", miliseconds.toString())
    .replace("dd", dd)
    .replace("d", day.toString())

    .replace("EEEE", EEEE)
    .replace("EEE", EEE)
    .replace("yyyy", yyyy)
    .replace("yy", yy)
    .replace("aaa", aaa);
  if (patternStr.indexOf("MMM") > -1) {
    patternStr = patternStr.replace("MMMM", MMMM).replace("MMM", MMM);
  } else {
    patternStr = patternStr.replace("MM", MM).replace("M", M.toString());
  }
  return patternStr;
}

/**
 * @summary Parses a date from a specified format
 * @param {string} format
 * @param {string | Date | number} [v]
 * @memberOf module:decorator-validation.Utils.Dates
 * @category Format
 */
export function parseDate(format: string, v?: string | Date | number) {
  let value: Date | undefined = undefined;

  if (!v) return undefined;

  if (v instanceof Date)
    try {
      value = dateFromFormat(formatDate(v as Date, format), format);
    } catch (e: any) {
      throw new Error(
        sf(`Could not convert date {0} to format: {1}`, v.toString(), format),
      );
    }
  else if (typeof v === "string") {
    value = dateFromFormat(v, format);
  } else if (typeof v === "number") {
    const d = new Date(v);
    value = dateFromFormat(formatDate(d, format), format);
  } else if (isValidDate(v)) {
    try {
      const d = new Date(v);
      value = dateFromFormat(formatDate(d, format), format);
    } catch (e) {
      throw new Error(
        sf(`Could not convert date {0} to format: {1}`, v, format),
      );
    }
  } else {
    throw new Error(`Invalid value provided ${v}`);
  }
  return bindDateToString(value, format);
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
  validator: Constructor<Validator> = DateValidator,
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

    Validation.register({
      validator: validator,
      validationKey: ValidationKeys.DATE,
      save: true,
    } as ValidatorDefinition);

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
  pattern: RegExp = PasswordPatterns.CHAR8_ONE_OF_EACH,
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
