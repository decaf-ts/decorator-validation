
/**
 * @summary References the relevant JS primitives
 *
 * @property {string} STRING references the string primitive
 * @property {string} NUMBER references the number primitive
 * @property {string} BOOLEAN references the boolean primitive
 * @property {string} BIGINT references the bigint primitive
 *
 * @constant Primitives
 * @memberOf module:decorator-validation.Construction
 * @category Model
 */
export enum Primitives {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    BIGINT = "bigint"
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
 * @memberOf module:decorator-validation.Construction
 * @category Construction
 */
export enum ReservedModels {
    STRING = "string",
    OBJECT = "object",
    NUMBER = "number",
    BOOLEAN = "boolean",
    BIGINT = "bigint",
    DATE = "date"
}