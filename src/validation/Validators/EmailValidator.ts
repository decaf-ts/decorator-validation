import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";
import PatternValidator from "./PatternValidator";

/**
 * Email Validator
 *
 * @class EmailValidator
 * @extends PatternValidator
 *
 * @category Validators
 */
export default class EmailValidator extends PatternValidator {
    private static readonly emailPat: RegExp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    constructor(message: string = DEFAULT_ERROR_MESSAGES.EMAIL){
        super(ValidationKeys.EMAIL, message)
    }

    /**
     *
     * @param {string} value
     * @param {string} [message]
     *
     * @return Errors
     *
     * @memberOf EmailValidator
     * @override
     *
     * @see Validator#hasErrors
     */
    // @ts-ignore
    public hasErrors(value: string, message?: string): Errors {
        return super.hasErrors(value, EmailValidator.emailPat, message);
    }
}