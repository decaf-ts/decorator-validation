/**
 * @description Error messages for comparison validators.
 * @summary Provides a centralized collection of error message templates for comparison-related validation errors.
 * @const COMPARISON_ERROR_MESSAGES
 * @memberOf module:decorator-validation
 */
export const COMPARISON_ERROR_MESSAGES = {
  INVALID_PATH:
    "Invalid path argument. Expected non-empty string but received: '{0}'",
  CONTEXT_NOT_OBJECT_COMPARISON:
    "Unable to access parent at level {0} for path '{1}': current context is not an object",
  PROPERTY_INVALID:
    "Failed to resolve path {0}: property '{1}' is invalid or does not exist.",
  PROPERTY_NOT_EXIST: "Failed to resolve path: property '{0}' does not exist.",
  UNSUPPORTED_TYPES_COMPARISON:
    "Unsupported types for comparison: '{0}' and '{1}'",
  NULL_OR_UNDEFINED_COMPARISON:
    "Comparison failed due to null or undefined value",
  INVALID_DATE_COMPARISON: "Invalid Date objects are not comparable",
  TYPE_MISMATCH_COMPARISON:
    "Cannot compare values of different types: {0} and {1}.",
  NAN_COMPARISON: "Comparison not supported for NaN values",
};
