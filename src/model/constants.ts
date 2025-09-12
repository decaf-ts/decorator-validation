/**
 * @description Enumeration of JavaScript primitive type identifiers used by the model system.
 * @summary References the relevant JS primitives and standardizes their string representations across the library.
 * @property {string} STRING references the string primitive
 * @property {string} NUMBER references the number primitive
 * @property {string} BOOLEAN references the boolean primitive
 * @property {string} BIGINT references the bigint primitive
 * @enum Primitives
 * @readonly
 * @memberOf module:decorator-validation
 */
export enum Primitives {
  /** references the string primitive */
  STRING = "string",
  /** references the number primitive */
  NUMBER = "number",
  /** references the boolean primitive */
  BOOLEAN = "boolean",
  /** references the bigint primitive */
  BIGINT = "bigint",
}

/**
 * @description Reserved model names which are excluded from model rebuilding.
 * @summary References the Reserved model names to ignore during Model rebuilding to avoid interfering with native types and special cases.
 * @property {string} STRING
 * @property {string} OBJECT
 * @property {string} NUMBER
 * @property {string} BOOLEAN
 * @property {string} BIGINT
 * @property {string} DATE
 * @enum ReservedModels
 * @readonly
 * @memberOf module:decorator-validation
 */
export enum ReservedModels {
  /** reserved name for string */
  STRING = "string",
  /** reserved name for object */
  OBJECT = "object",
  /** reserved name for number */
  NUMBER = "number",
  /** reserved name for boolean */
  BOOLEAN = "boolean",
  /** reserved name for bigint */
  BIGINT = "bigint",
  /** reserved name for Date */
  DATE = "date",
}

/**
 * @description Basic supported JavaScript types used by the validation system.
 * @summary References the basic supported JS types as strings that can be used for type checking and metadata.
 * @typedef {Object} JsTypes
 * @property {"string"} string String primitive identifier
 * @property {"array"} array Array type identifier
 * @property {"number"} number Number primitive identifier
 * @property {"boolean"} boolean Boolean primitive identifier
 * @property {"symbol"} symbol Symbol primitive identifier
 * @property {"function"} function Function type identifier
 * @property {"object"} object Object type identifier
 * @property {"undefined"} undefined Undefined type identifier
 * @property {"null"} null Null value identifier
 * @property {"bigint"} BIGINT BigInt primitive identifier
 * @memberOf module:decorator-validation
 */
export const jsTypes = [
  "string",
  "array",
  "number",
  "boolean",
  "symbol",
  "function",
  "object",
  "undefined",
  "null",
  "bigint",
];
