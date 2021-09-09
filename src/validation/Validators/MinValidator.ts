import Validator from "./Validator";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";

/**
 * Min Validator
 *
 * @class MinValidator
 * @extends Validator
 * @memberOf Validators
 */
export default class MinValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.MIN){
        super(ValidationKeys.MIN, message)
    }

    public hasErrors(value: number, min: number, message?: string): Errors {
        if (value === undefined)
            return;
        return value < min ? this.getMessage(message || this.message, min) : undefined;
    }
}