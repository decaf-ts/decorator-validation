import Validator from "./Validator";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";

/**
 * Date Validator
 *
 * @class DateValidator
 * @extends Validator
 *
 * @category Validators
 */
export default class DateValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.DATE){
        super(ValidationKeys.DATE, message, Number.name, Date.name, String.name);
    }

    /**
     *
     * @param {Date | string} value
     * @param {string} format
     * @param {string} [message]
     *
     * @return Errors
     *
     * @memberOf DateValidator
     * @override
     *
     * @see Validator#hasErrors
     */
    public hasErrors(value: Date | string, format: string, message?: string): Errors {
        if (value === undefined)
            return;

        if (typeof value === 'string')
            value = new Date(value);

        if (isNaN(value.getDate()))
            return this.getMessage(message || this.message);
    }
}