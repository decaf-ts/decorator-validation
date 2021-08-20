/**
 * @namespace Decorators
 * @memberOf Validation
 */

import "reflect-metadata";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "./constants";
import {ValidatorRegistry} from "./validation";
import RequiredValidator from './Validators/RequiredValidator';
import EmailValidator from './Validators/EmailValidator';
import MaxValidator from './Validators/MaxValidator';
import MaxLengthValidator from './Validators/MaxLengthValidator';
import MinValidator from './Validators/MinValidator';
import MinLengthValidator from './Validators/MinLengthValidator';
import URLValidator from "./Validators/URLValidator";
import PatternValidator from "./Validators/PatternValidator";
import {ValidatorDefinition} from "./types";

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
 * @decorator
 * @namespace Decorators
 * @memberOf Validation
 */
export const required = (message: string = DEFAULT_ERROR_MESSAGES.REQUIRED) => (target: any, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.REQUIRED),
        {
            message: message
        },
        target,
        propertyKey
    );
    ValidatorRegistry.register({validator: RequiredValidator, validationKey: ValidationKeys.REQUIRED});
}

/**
 * Defines a minimum value for the property
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.MIN}
 *
 * @param {number | Date} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.MIN}
 * @decorator
 * @namespace Decorators
 * @memberOf Validation
 */
export const min = (value: number | Date | string, message: string = DEFAULT_ERROR_MESSAGES.MIN) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.MIN),
        {
            value: value,
            message: message
        },
        target,
        propertyKey
    );
    ValidatorRegistry.register({validator: MinValidator, validationKey: ValidationKeys.MIN});
}

/**
 * Defines a maximum value for the property
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.MAX}
 *
 * @param {number | Date} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.MAX}
 * @decorator
 * @namespace Decorators
 * @memberOf Validation
 */
export const max = (value: number | Date | string, message: string = DEFAULT_ERROR_MESSAGES.MAX) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.MAX),
        {
            value: value,
            message: message
        },
        target,
        propertyKey
    );

    ValidatorRegistry.register({validator: MaxValidator, validationKey: ValidationKeys.MAX});
}

/**
 * Defines a minimum length for the property
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.MIN_LENGTH}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.MIN_LENGTH}
 * @decorator
 * @namespace Decorators
 * @memberOf Validation
 */
export const minlength = (value: number, message: string = DEFAULT_ERROR_MESSAGES.MIN_LENGTH) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.MIN_LENGTH),
        {
            value: value,
            message: message
        },
        target,
        propertyKey
    );
    ValidatorRegistry.register({validator: MinLengthValidator, validationKey: ValidationKeys.MIN_LENGTH});
}

/**
 * Defines a maximum length for the property
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.MAX_LENGTH}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.MAX_LENGTH}
 * @decorator
 * @namespace Decorators
 * @memberOf Validation
 */
export const maxlength = (value: number, message: string = DEFAULT_ERROR_MESSAGES.MAX_LENGTH) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.MAX_LENGTH),
        {
            value: value,
            message: message
        },
        target,
        propertyKey
    );
    ValidatorRegistry.register({validator: MaxLengthValidator, validationKey: ValidationKeys.MAX_LENGTH});
}

/**
 * Defines a RegExp pattern the property must respect
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.PATTERN}
 *
 * @param {string} value
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.PATTERN}
 * @decorator
 * @namespace Decorators
 * @memberOf Validation
 */
export const pattern = (value: RegExp | string, message: string = DEFAULT_ERROR_MESSAGES.PATTERN) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.PATTERN),
        {
            value: typeof value === 'string' ? value : value.toString(),
            message: message
        },
        target,
        propertyKey
    );
    ValidatorRegistry.register({validator: PatternValidator, validationKey: ValidationKeys.PATTERN});
}

/**
 * Defines the property as an email
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.EMAIL}
 *
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.EMAIL}
 * @decorator
 * @namespace Decorators
 * @memberOf Validation
 */
export const email = (message: string = DEFAULT_ERROR_MESSAGES.EMAIL) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.EMAIL),
        {
            message: message
        },
        target,
        propertyKey
    );
    ValidatorRegistry.register({validator: EmailValidator, validationKey: ValidationKeys.EMAIL});
}

/**
 * Defines the property as an URL
 *
 * Validators to validate a decorated property must use key {@link ValidationKeys.URL}
 *
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES.URL}
 * @decorator
 * @namespace Decorators
 * @memberOf Validation
 */
export const url = (message: string = DEFAULT_ERROR_MESSAGES.URL) => (target: Object, propertyKey: string) => {
    Reflect.defineMetadata(
        getValidationKey(ValidationKeys.URL),
        {
            message: message
        },
        target,
        propertyKey
    );
    ValidatorRegistry.register({validator: URLValidator, validationKey: ValidationKeys.URL});
}