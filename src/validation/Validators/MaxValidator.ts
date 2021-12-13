import Validator from "./Validator";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";

/**
 * Max Validator
 *
 * @class MaxValidator
 * @extends Validator
 *
 * @category Validators
 */
export default class MaxValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.MAX){
        super(ValidationKeys.MAX, message, "number", "Date");
    }

    /**
     *
     * @param {string} value
     * @param {number | Date | string} max
     * @param {string} [message]
     *
     * @return Errors
     *
     * @memberOf MaxValidator
     * @override
     *
     * @see Validator#hasErrors
     */
    public hasErrors(value: number | Date, max: number | Date | string, message?: string): Errors {
        if (value === undefined)
            return;
        if (value instanceof Date && !(max instanceof Date)){
            max = new Date(max);
            if (isNaN(max.getDate()))
                throw new Error(`Invalid Max param defined`)
        }

        return value > max ? this.getMessage(message || this.message, max) : undefined;
    }
}