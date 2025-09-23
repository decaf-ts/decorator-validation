/**
 * @description Object-like set of keys used for comparison-based validations.
 * @summary Provides canonical names for validators that compare two values (equality and ordering checks).
 * @typedef {Object} ComparisonValidationKeysDef
 * @property {"equals"} EQUALS Validates if two values are equal.
 * @property {"different"} DIFF Validates if two values are different.
 * @property {"lessThan"} LESS_THAN Validates if a value is less than another.
 * @property {"lessThanOrEqual"} LESS_THAN_OR_EQUAL Validates if a value is less than or equal to another.
 * @property {"greaterThan"} GREATER_THAN Validates if a value is greater than another.
 * @property {"greaterThanOrEqual"} GREATER_THAN_OR_EQUAL Validates if a value is greater than or equal to another.
 * @memberOf module:decorator-validation.Validation
 */

/**
 * @description Keys used for comparison-based validations.
 * @summary Canonical key names for comparison validators.
 * @const ComparisonValidationKeys
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 * @type {ComparisonValidationKeysDef}
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
 * @description Object-like set of keys used across all validators in the system.
 * @summary Defines the canonical namespaced key prefix and the individual validation flags for rules such as required, min/max, length, patterns, types, lists and more.
 * @typedef {Object} ValidationKeysDef
 * @property {string} REFLECT prefixes others (namespace prefix)
 * @property {"required"} REQUIRED sets as required
 * @property {"min"} MIN defines min value
 * @property {"max"} MAX defines max value
 * @property {"step"} STEP defines step
 * @property {"minlength"} MIN_LENGTH defines min length
 * @property {"maxlength"} MAX_LENGTH defines max length
 * @property {"pattern"} PATTERN defines pattern
 * @property {"email"} EMAIL defines email
 * @property {"url"} URL defines url
 * @property {"date"} DATE defines date
 * @property {"type"} TYPE defines type
 * @property {"password"} PASSWORD defines password
 * @property {"list"} LIST defines list
 * @property {"unique"} UNIQUE flags uniqueness
 * @property {"validator"} VALIDATOR custom validator id
 * @memberOf module:decorator-validation.Validation
 */

/**
 * @description The keys used for validation.
 * @summary A namespaced collection of validation key strings used throughout the library.
 * @const ValidationKeys
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 * @type {ValidationKeysDef}
 */
export const ValidationKeys = {
  REFLECT: `validation`,
  DATE: "date",
  EMAIL: "email",
  FORMAT: "format",
  LIST: "list",
  MAX: "max",
  MAX_LENGTH: "maxlength",
  MIN: "min",
  MIN_LENGTH: "minlength",
  PASSWORD: "password",
  PATTERN: "pattern",
  REQUIRED: "required",
  STEP: "step",
  TYPE: "type",
  UNIQUE: "unique",
  URL: "url",
  VALIDATOR: "validator",
  ...ComparisonValidationKeys,
} as const;

/**
 * @description list of month names
 * @summary Stores month names. Can be changed for localization purposes
 * @const MONTH_NAMES
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
 * @description list of names of days of the week
 * @summary Stores names for days of the week. Can be changed for localization purposes
 * @const DAYS_OF_WEEK_NAMES
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
 * @description Type definition for default error message strings keyed by validation type.
 * @summary Enumerates the supported error message keys with their intended meaning; used to localize or override default messages.
 * @typedef {Object} DefaultErrorMessages
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
 * @memberOf module:decorator-validation.Validation
 */

/**
 * @description Defines the default error messages
 * @summary Mapping between validation keys and their default human-readable error messages.
 * @const DEFAULT_ERROR_MESSAGES
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 * @type {DefaultErrorMessages}
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
  UNIQUE: "Duplicate found, this field must be unique.",
};

/**
 * @description Type definition for default regular expression patterns used in validation.
 * @summary Captures common regex patterns for email, URL, and password policies, including nested grouping for password-related rules.
 * @typedef {Object} DefaultPatterns
 * @property {RegExp} EMAIL Email address validation pattern
 * @property {RegExp} URL URL validation pattern
 * @property {Object} PASSWORD Password-related regex patterns
 * @property {RegExp} PASSWORD.CHAR8_ONE_OF_EACH At least 8 chars with lower, upper, number, and special char
 * @memberOf module:decorator-validation.Validation
 */

/**
 * @description Defines the various default regexp patterns used
 * @summary Collection of frequently used validation patterns grouped under semantic keys.
 * @const DEFAULT_PATTERNS
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 * @type {DefaultPatterns}
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
