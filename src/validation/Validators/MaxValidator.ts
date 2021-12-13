import Validator from "./Validator";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";

/**
 * Max Validator
 *
 * @class MaxValidator
 * @extends Validator
 *
 * @memberOf validation.validators
 */
export default class MaxValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.MAX){
        super(ValidationKeys.MAX, message, "number", "Date");
    }

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