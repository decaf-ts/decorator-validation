/**
 * @summary References the relevant JS primitives
 *
 * @property {string} STRING references the string primitive
 * @property {string} NUMBER references the number primitive
 * @property {string} BOOLEAN references the boolean primitive
 * @property {string} BIGINT references the bigint primitive
 *
 * @constant Primitives
 * @memberOf module:decorator-validation.Model
 */
export enum Primitives {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  BIGINT = "bigint",
}

/**
 * @summary References the Reserved model names to ignore during Model rebuilding
 *
 * @property {string} STRING
 * @property {string} OBJECT
 * @property {string} NUMBER
 * @property {string} BOOLEAN
 * @property {string} BIGINT
 * @property {string} DATE
 *
 * @constant ReservedModels
 * @memberOf module:decorator-validation.Model
 */
export enum ReservedModels {
  STRING = "string",
  OBJECT = "object",
  NUMBER = "number",
  BOOLEAN = "boolean",
  BIGINT = "bigint",
  DATE = "date",
}

/**
 * @summary References the basic supported js types
 *
 * @property {string} string
 * @property {string} array
 * @property {string} number
 * @property {string} boolean
 * @property {string} symbol
 * @property {string} function
 * @property {string} object
 * @property {string} undefined
 * @property {string} null
 * @property {string} BIGINT
 *
 * @constant jsTypes
 * @memberOf module:decorator-validation.Model
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
