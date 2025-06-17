import { ModelKeys } from "../../utils/constants";

/**
 * @summary Keys used for comparison-based validations.
 *
 * @property {string} EQUALS - Validates if two values are equal.
 * @property {string} DIFF - Validates if two values are different.
 * @property {string} LESS_THAN - Validates if a value is less than another.
 * @property {string} LESS_THAN_OR_EQUAL - Validates if a value is less than or equal to another.
 * @property {string} GREATER_THAN - Validates if a value is greater than another.
 * @property {string} GREATER_THAN_OR_EQUAL - Validates if a value is greater than or equal to another.
 *
 * @constant ComparisonValidationKeys
 * @memberof module:decorator-validation.Validation
 * @category Validation
 */
export const ComparisonValidationKeys = {
  EQUALS: "equals",
  DIFF: "different",
  LESS_THAN: "lessThan",
  LESS_THAN_OR_EQUAL: "lessThanOrEqual",
  GREATER_THAN: "greaterThan",
  GREATER_THAN_OR_EQUAL: "greaterThanOrEqual",
} as const;

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
  REFLECT: `${ModelKeys.REFLECT}validation.`,
  VALIDATOR: "validator",
  REQUIRED: "required",
  MIN: "min",
  MAX: "max",
  STEP: "step",
  MIN_LENGTH: "minlength",
  MAX_LENGTH: "maxlength",
  PATTERN: "pattern",
  EMAIL: "email",
  URL: "url",
  DATE: "date",
  TYPE: "type",
  PASSWORD: "password",
  LIST: "list",
  FORMAT: "format",
  ...ComparisonValidationKeys,
} as const;

/**
 * @summary list of month names
 * @description Stores month names. Can be changed for localization purposes
 *
 * @constant MONTH_NAMES
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
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
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
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
  REQUIRED: "This field is required",
  MIN: "The minimum value is {0}",
  MAX: "The maximum value is {0}",
  MIN_LENGTH: "The minimum length is {0}",
  MAX_LENGTH: "The maximum length is {0}",
  PATTERN: "The value does not match the pattern",
  EMAIL: "The value is not a valid email",
  URL: "The value is not a valid URL",
  TYPE: "Invalid type. Expected {0}, received {1}",
  STEP: "Invalid value. Not a step of {0}",
  DATE: "Invalid value. not a valid Date",
  DEFAULT: "There is an Error",
  PASSWORD:
    "Must be at least 8 characters and contain one of number, lower and upper case letters, and special character (@$!%*?&_-.,)",
  LIST: "Invalid list of {0}",
  MODEL_NOT_FOUND: "No model registered under {0}",
  EQUALS: "This field must be equal to field {0}",
  DIFF: "This field must be different from field {0}",
  LESS_THAN: "This field must be less than field {0}",
  LESS_THAN_OR_EQUAL: "This field must be less than or equal to field {0}",
  GREATER_THAN: "This field must be greater than field {0}",
  GREATER_THAN_OR_EQUAL:
    "This field must be greater than or equal to field {0}",
};

/**
 * @summary Defines the various default regexp patterns used
 *
 * @enum DEFAULT_PATTERNS
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export const DEFAULT_PATTERNS = {
  EMAIL:
    /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/,
  URL: /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i,
  PASSWORD: {
    CHAR8_ONE_OF_EACH:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-.,])[A-Za-z\d@$!%*?&_\-.,]{8,}$/g,
  },
};
