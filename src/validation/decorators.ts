/**
 * @namespace Decorators
 * @memberOf Validation
 */

import "reflect-metadata";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "./constants";
import {getValidatorRegistry} from "./validation";
import RequiredValidator from './Validators/RequiredValidator';
import EmailValidator from './Validators/EmailValidator';
import MaxValidator from './Validators/MaxValidator';
import MaxLengthValidator from './Validators/MaxLengthValidator';
import MinValidator from './Validators/MinValidator';
import MinLengthValidator from './Validators/MinLengthValidator';
import URLValidator from "./Validators/URLValidator";
import PatternValidator from "./Validators/PatternValidator";
import TypeValidator from "./Validators/TypeValidator";
import StepValidator from "./Validators/StepValidator";
import DateValidator from "./Validators/DateValidator";
import {formatDate} from "../utils";
import Validator from "./Validators/Validator";

/**
 * @param {string} key
 * @function
 * @namespace Decorators
 * @memberOf Validation
 */
export const getValidationKey = (key: string) => ValidationKeys.REFLECT + key;

/**
 * Marks the property as required.
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.REQUIRED}
 *
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.REQUIRED}
 * @param {{new(): Validator}} [validator] the Validator to be used. Defaults to {@link RequiredValidator}
 * @decorator required
 * @namespace Decorators
 * @memberOf Validation
 */
export const required = (message: string = DEFAULT_ERROR_MESSAGES.REQUIRED, validator: {new(): Validator} = RequiredValidator) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.REQUIRED),
        {
            message: message
        },
        target,
        propertyKey
    );
    getValidatorRegistry().register({validator: validator, validationKey: ValidationKeys.REQUIRED});
}

/**
 * Defines a minimum value for the property
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.MIN}
 *
 * @param {number | Date} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.MIN}
 * @param {{new(): Validator}} [validator] the Validator to be used. Defaults to {@link MinValidator}
 * @decorator min
 * @namespace Decorators
 * @memberOf Validation
 */
export const min = (value: number | Date | string, message: string = DEFAULT_ERROR_MESSAGES.MIN, validator: {new(): Validator} = MinValidator) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.MIN),
        {
            value: value,
            message: message,
            types: [Number.name, Date.name]
        },
        target,
        propertyKey
    );
    getValidatorRegistry().register({validator: validator, validationKey: ValidationKeys.MIN});
}

/**
 * Defines a maximum value for the property
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.MAX}
 *
 * @param {number | Date} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.MAX}
 * @param {{new(): Validator}} [validator] the Validator to be used. Defaults to {@link MaxValidator}
 * @decorator max
 * @namespace Decorators
 * @memberOf Validation
 */
export const max = (value: number | Date | string, message: string = DEFAULT_ERROR_MESSAGES.MAX, validator: {new(): Validator} = MaxValidator) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.MAX),
        {
            value: value,
            message: message,
            types: [Number.name, Date.name]
        },
        target,
        propertyKey
    );

    getValidatorRegistry().register({validator: validator, validationKey: ValidationKeys.MAX});
}

/**
 * Defines a step value for the property
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.STEP}
 *
 * @param {number} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.STEP}
 * @param {{new(): Validator}} [validator] the Validator to be used. Defaults to {@link StepValidator}
 * @decorator step
 * @namespace Decorators
 * @memberOf Validation
 */
export const step = (value: number, message: string = DEFAULT_ERROR_MESSAGES.STEP, validator: {new(): Validator} = StepValidator) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.STEP),
        {
            value: value,
            message: message,
            types: [Number.name]
        },
        target,
        propertyKey
    );

    getValidatorRegistry().register({validator: validator, validationKey: ValidationKeys.STEP});
}

/**
 * Defines a minimum length for the property
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.MIN_LENGTH}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.MIN_LENGTH}
 * @param {{new(): Validator}} [validator] the Validator to be used. Defaults to {@link MinLengthValidator}
 * @decorator minlength
 * @namespace Decorators
 * @memberOf Validation
 */
export const minlength = (value: number, message: string = DEFAULT_ERROR_MESSAGES.MIN_LENGTH, validator: {new(): Validator} = MinLengthValidator) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.MIN_LENGTH),
        {
            value: value,
            message: message,
            types: [String.name]
        },
        target,
        propertyKey
    );
    getValidatorRegistry().register({validator: validator, validationKey: ValidationKeys.MIN_LENGTH});
}

/**
 * Defines a maximum length for the property
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.MAX_LENGTH}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.MAX_LENGTH}
 * @param {{new(): Validator}} [validator] the Validator to be used. Defaults to {@link MaxLengthValidator}
 * @decorator maxlength
 * @namespace Decorators
 * @memberOf Validation
 */
export const maxlength = (value: number, message: string = DEFAULT_ERROR_MESSAGES.MAX_LENGTH, validator: {new(): Validator} = MaxLengthValidator) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.MAX_LENGTH),
        {
            value: value,
            message: message,
            types: [String.name]
        },
        target,
        propertyKey
    );
    getValidatorRegistry().register({validator: validator, validationKey: ValidationKeys.MAX_LENGTH});
}

/**
 * Defines a RegExp pattern the property must respect
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.PATTERN}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.PATTERN}
 * @param {{new(): Validator}} [validator] the Validator to be used. Defaults to {@link PatternValidator}
 * @decorator pattern
 * @namespace Decorators
 * @memberOf Validation
 */
export const pattern = (value: RegExp | string, message: string = DEFAULT_ERROR_MESSAGES.PATTERN, validator: {new(): Validator} = PatternValidator) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.PATTERN),
        {
            value: typeof value === 'string' ? value : value.toString(),
            message: message,
            types: [String.name]
        },
        target,
        propertyKey
    );
    getValidatorRegistry().register({validator: validator, validationKey: ValidationKeys.PATTERN});
}

/**
 * Defines the property as an email
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.EMAIL}
 *
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.EMAIL}
 * @param {{new(): Validator}} [validator] the Validator to be used. Defaults to {@link EmailValidator}
 * @decorator email
 * @namespace Decorators
 * @memberOf Validation
 */
export const email = (message: string = DEFAULT_ERROR_MESSAGES.EMAIL, validator: {new(): Validator} = EmailValidator) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.EMAIL),
        {
            message: message,
            types: [String.name]
        },
        target,
        propertyKey
    );
    getValidatorRegistry().register({validator: validator, validationKey: ValidationKeys.EMAIL});
}

/**
 * Defines the property as an URL
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.URL}
 *
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.URL}
 * @param {{new(): Validator}} [validator] the Validator to be used. Defaults to {@link URLValidator}
 * @decorator url
 * @namespace Decorators
 * @memberOf Validation
 */
export const url = (message: string = DEFAULT_ERROR_MESSAGES.URL, validator: {new(): Validator} = URLValidator) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.URL),
        {
            message: message,
            types: [String.name]
        },
        target,
        propertyKey
    );
    getValidatorRegistry().register({validator: validator, validationKey: ValidationKeys.URL});
}

/**
 * Enforces type verification
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.TYPE}
 *
 * @param {string[] | string} types accepted types
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.TYPE}
 * @param {{new(): Validator}} [validator] the Validator to be used. Defaults to {@link TypeValidator}
 * @decorator type
 * @namespace Decorators
 * @memberOf Validation
 */
export const type = (types: string[] | string, message: string = DEFAULT_ERROR_MESSAGES.TYPE, validator: {new(): Validator} = TypeValidator) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.TYPE),
        {
            customTypes: types,
            message: message
        },
        target,
        propertyKey
    );
    getValidatorRegistry().register({validator: validator, validationKey: ValidationKeys.TYPE});
}

/**
 * Date Handler Decorator
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.DATE}
 *
 * Will enforce serialization according to the selected format
 *
 * @param {string} format accepted format according to {@link }
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.DATE}
 * @param {{new(): Validator}} [validator] the Validator to be used. Defaults to {@link DateValidator}
 * @decorator date
 * @namespace Decorators
 * @memberOf Validation
 */
export const date = (format: string = "dd/MM/yyyy", message: string = DEFAULT_ERROR_MESSAGES.DATE, validator: {new(): Validator} = DateValidator) => (target: {[indexer: string]: any}, propertyKey: string): any => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.DATE),
        {
            format: format,
            message: message,
            types: [Date.name]
        },
        target,
        propertyKey
    );
    getValidatorRegistry().register({validator: validator, validationKey: ValidationKeys.DATE});

    const bindDateToString = function(date: Date | undefined){
        if (!date)
            return;
        const func = () => formatDate(date, format);
        date.toISOString = func;
        date.toString = func;
        return date;
    }

    const parseDate = function(v?: string | Date | number){
        let value: Date | undefined = undefined;
        if (!v || v instanceof Date)
        { // @ts-ignore
            value = v;
        }
        else if (typeof v === 'string' || typeof v === 'number')
            value = new Date(v);
        else
            throw new Error(`Invalid value provided ${v}`);
        return bindDateToString(value);
    }

    const values = new WeakMap();

    Object.defineProperty(target, propertyKey, {
        set(this: any, newValue: string | Date){

            Object.defineProperty(this, propertyKey, {
                enumerable: true,
                configurable: false,
                get: () => values.get(this),
                set: (newValue: string | Date) => values.set(this, parseDate(newValue))
            });

            this[propertyKey] = newValue;
        }
    });
}