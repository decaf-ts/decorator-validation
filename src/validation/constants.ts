/**
 * @namespace decorator-validation.validation.constants
 * @memberOf decorator-validation.validation
 */

/**
 * @enum ValidationKeys
 *
 * @memberOf decorator-validation.validation.constants
 */
export const ValidationKeys = {
    REFLECT: 'model.validation.',
    REQUIRED: 'required',
    MIN: 'min',
    MAX: 'max',
    STEP: 'step',
    MIN_LENGTH: 'minlength',
    MAX_LENGTH: 'maxlength',
    PATTERN: 'pattern',
    EMAIL: "email",
    URL: "url",
    DATE: "date",
    TYPE: "type"
}

/**
 * @enum DEFAULT_ERROR_MESSAGES
 *
 * @memberOf decorator-validation.validation.constants
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
    TYPE: "Invalid Type. Expected {0}, received {1}",
    STEP: "Invalid Value. Not a step of {0}",
    DATE: "Invalid value. not a valid Date",
    DEFAULT: "There is an Error"
}