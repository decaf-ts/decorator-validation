/**
 * @description Symbol key for tracking parent-child relationships in validation.
 * @summary Symbol used to internally track the parent object during nested validation.
 *
 * @const VALIDATION_PARENT_KEY
 * @memberOf module:decorator-validation
 */
export const VALIDATION_PARENT_KEY = Symbol("_parent");

/**
 * @description Symbol key for tracking asynchronous validation metadata.
 * @summary Symbol used to identify whether a validation process should be treated as asynchronous.
 *
 * @const ASYNC_META_KEY
 * @memberOf module:decorator-validation
 */
export const ASYNC_META_KEY = Symbol("isAsync");
