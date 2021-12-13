import {Errors} from "../types";
import Validator from "./Validator";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";

/**
 * Max Length Validator
 *
 * @class MaxLengthValidator
 * @extends Validator
 *
 * @memberOf validation.validators
 */
export default class MaxLengthValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.MAX_LENGTH){
        super(ValidationKeys.MAX_LENGTH, message, "string")
    }

    public hasErrors(value: string, maxlength: number, message?: string): Errors {
        if (value === undefined)
            return;
        return value.length > maxlength ? this.getMessage(message || this.message, maxlength) : undefined;
    }
}