import Validator from "./Validator";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";

/**
 * Min Validator
 *
 * @class MinValidator
 * @extends Validator
 *
 * @category Validators
 */
export default class MinValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.MIN){
        super(ValidationKeys.MIN, message, "number", "Date")
    }

    /**
     *
     * @param {string} value
     * @param {number | Date | string} min
     * @param {string} [message]
     *
     * @return Errors
     *
     * @memberOf MinValidator
     * @override
     *
     * @see Validator#hasErrors
     */
    public hasErrors(value: number | Date, min: number | Date | string, message?: string): Errors {
        if (value === undefined)
            return;

        if (value instanceof Date && !(min instanceof Date)){
            min = new Date(min);
            if (isNaN(min.getDate()))
                throw new Error(`Invalid Min param defined`)
        }
        return value < min ? this.getMessage(message || this.message, min) : undefined;
    }
}