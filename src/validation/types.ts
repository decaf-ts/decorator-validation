import Validator from "./Validators/Validator";

/**
 * @memberOf Validation
 * @typedef Errors
 */
export type Errors = string | string[] | undefined;

/**
 * @memberOf Validation
 * @typedef Registry
 */
export type Registry = {
    register(...validator: { new(): Validator }[] | Validator[]) : void;
    getValidator(name: string): Validator;
}

/**
 * @interface Validatable
 * @memberOf Validation
 */
export default interface Validatable {
    /**
     * @param {any} [args]
     * @memberOf Validatable
     */
    hasErrors(...args: any[]) : Errors;
}