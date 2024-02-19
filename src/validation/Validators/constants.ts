/**
 * @summary The keys used for validation
 *
 * @property {string} REFLECT prefixes others
 * @property {string} REQUIRED sets as required
 * @property {string} MIN defines min value
 * @property {string} MAX defines max value
 * @property {string} STEP defines step
 * @property {string} MIN_LENGTH defines min length
 * @property {string} MAX_LENGTH defines max length
 * @property {string} PATTERN defines pattern
 * @property {string} EMAIL defines email
 * @property {string} URL defines url
 * @property {string} DATE defines date
 * @property {string} TYPE defines type
 * @property {string} PASSWORD defines password
 * @property {string} LIST defines list
 *
 * @constant ValidationKeys
 * @memberOf module:decorator-validation.Validation
 * @category Validation
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
    TYPE: "type",
    PASSWORD: "password",
    LIST: "list",
}

/**
 * @summary list of month names
 * @description Stores month names. Can be changed for localization purposes
 *
 * @constant MONTH_NAMES
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
];

/**
 * @summary list of names of days of the week
 * @description Stores names for days of the week. Can be changed for localization purposes
 *
 * @constant DAYS_OF_WEEK_NAMES
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export const DAYS_OF_WEEK_NAMES = [
    "Sunday", "Monday", "Tuesday",
    "Wednesday", "Thursday", "Friday", "Saturday"
];


/**
 * @summary Defines the default error messages
 *
 * @property {string} REQUIRED default error message
 * @property {string} MIN default error message
 * @property {string} MAX default error message
 * @property {string} MIN_LENGTH default error message
 * @property {string} MAX_LENGTH default error message
 * @property {string} PATTERN default error message
 * @property {string} EMAIL default error message
 * @property {string} URL default error message
 * @property {string} TYPE default error message
 * @property {string} STEP default error message
 * @property {string} DATE default error message
 * @property {string} DEFAULT default error message
 * @property {string} PASSWORD default error message
 * @property {string} LIST default error message
 * @property {string} LIST_INSIDE default error message
 * @property {string} MODEL_NOT_FOUND default error message
 *
 * @constant DEFAULT_ERROR_MESSAGES
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
    REQUIRED: 'This field is required',
    MIN: 'The minimum value is {0}',
    MAX: 'The maximum value is {0}',
    MIN_LENGTH: 'The minimum length is {0}',
    MAX_LENGTH: 'The maximum length is {0}',
    PATTERN: 'The value does not match the pattern',
    EMAIL: "The value is not a valid email",
    URL: "The value is not a valid URL",
    TYPE: "Invalid type. Expected {0}, received {1}",
    STEP: "Invalid value. Not a step of {0}",
    DATE: "Invalid value. not a valid Date",
    DEFAULT: "There is an Error",
    PASSWORD: "Must be at least 8 characters and contain one of number, lower and upper case letters, and special character (@$!%*?&_-.,)",
    LIST: "Invalid list of {0}",
    LIST_INSIDE: "Elements of list are invalid: {0}",
    MODEL_NOT_FOUND: "No model registered under {0}"
}
/**
 * @summary Defines a Password validation regexp
 *
 * @enum DEFAULT_ERROR_MESSAGES
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export const PasswordPatterns = {
    CHAR8_ONE_OF_EACH: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-.,])[A-Za-z\d@$!%*?&_\-.,]{8,}$/g
}