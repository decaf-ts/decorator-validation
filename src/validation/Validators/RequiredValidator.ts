import Validator from "./Validator";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";

/**
 * Required Validator
 *
 * @class RequiredValidator
 * @extends Validator
 *
 * @category Validators
 */
export default class RequiredValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.REQUIRED){
        super(ValidationKeys.REQUIRED, message)
    }

    /**
     *
     * @param {string} value
     * @param {string} [message]
     *
     * @return Errors
     *
     * @memberOf RequiredValidator
     * @override
     *
     * @see Validator#hasErrors
     */
    public hasErrors(value: any, message?: string): Errors {
        return !value ? this.getMessage(message || this.message) : undefined;
    }
}