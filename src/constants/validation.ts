/**
 * Symbol used to internally track the parent object during nested validation.
 *
 * This key is attached to child objects to provide context about their parent
 * in the object hierarchy, enabling validations that depend on parent values.
 *
 * @constant VALIDATION_PARENT_KEY
 * @memberOf module:decorator-validation.Model
 */
export const VALIDATION_PARENT_KEY = Symbol("_validationParent");
