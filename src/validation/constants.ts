/**
 * @enum
 * @namespace Validation
 * @memberOf decorator-validation
 */
export const ValidationKeys = {
    REFLECT: 'model.validation.',
    REQUIRED: 'required',
    MIN: 'min',
    MAX: 'max',
    MIN_LENGTH: 'minlength',
    MAX_LENGTH: 'maxlength',
    PATTERN: 'pattern',
    EMAIL: "email",
    URL: "url"
}

/**
 * @enum
 * @namespace Validation
 * @memberOf decorator-validation
 */
export const DEFAULT_ERROR_MESSAGES = {
    REQUIRED: 'This field is required',
    MIN: 'The minimum value is {0}',
    MAX: 'The maximum value is {0}',
    MIN_LENGTH: 'The minimum length is {0}',
    MAX_LENGTH: 'The maximum length is {0}',
    PATTERN: 'The value does not match the pattern',
    EMAIL: "The value is not a valid email",
    URL: "The value is not a valid URL",
    DEFAULT: "There is an Error"
}