import Validator from "./Validator";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";

/**
 * Step Validator
 *
 * @class StepValidator
 * @extends Validator
 *
 * @category Validators
 */
export default class StepValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.STEP){
        super(ValidationKeys.STEP, message, "number");
    }

    /**
     *
     * @param {string} value
     * @param {number} step
     * @param {string} [message]
     *
     * @return Errors
     *
     * @memberOf StepValidator
     * @override
     *
     * @see Validator#hasErrors
     */
    public hasErrors(value: number, step: number, message?: string): Errors {
        if (value === undefined)
            return;
        return value % step !== 0 ? this.getMessage(message || this.message, step) : undefined;
    }
}