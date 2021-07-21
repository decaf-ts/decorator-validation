import Validator from "./Validator";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";

/**
 * Min Length Validator
 *
 * @class MinLengthValidator
 * @extends Validator
 * @memberOf Validators
 */
export default class MinLengthValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.MIN_LENGTH){
        super(ValidationKeys.MIN_LENGTH, message)
    }

    hasErrors(value: string, minlength: number, message?: string): Errors {
        if (value === undefined)
            return;
        return value.length < minlength ? this.getMessage(message || this.message, minlength) : undefined;
    }
}