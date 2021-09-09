import Validator from "./Validator";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";

/**
 * Max Validator
 *
 * @class MaxValidator
 * @extends Validator
 * @memberOf Validators
 */
export default class MaxValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.MAX){
        super(ValidationKeys.MAX, message)
    }

    public hasErrors(value: number, max: number, message?: string): Errors {
        if (value === undefined)
            return;
        return value > max ? this.getMessage(message || this.message, max) : undefined;
    }
}