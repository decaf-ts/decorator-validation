import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";
import PatternValidator from "./PatternValidator";

/**
 * Email Validator
 *
 * @class EmailValidator
 * @extends PatternValidator
 * @memberOf Validators
 */
export default class EmailValidator extends PatternValidator {
    private static readonly emailPat: RegExp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    constructor(message: string = DEFAULT_ERROR_MESSAGES.EMAIL){
        super(ValidationKeys.EMAIL, message)
    }

    // @ts-ignore
    hasErrors(value: string, message?: string): Errors {
        return super.hasErrors(value, EmailValidator.emailPat, message);
    }
}