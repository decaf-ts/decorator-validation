import {stringFormat} from "../../utils";
import {Errors} from "../types";
import {DEFAULT_ERROR_MESSAGES} from "../constants";

/**
 * Base Implementation for Validators
 *
 * @class Validator
 * @abstract
 * @implements Validatable
 * @memberOf Validators
 */
export default abstract class Validator{
    readonly validationKey: string;
    readonly message: string;


    protected constructor(validationKey: string, message: string = DEFAULT_ERROR_MESSAGES.DEFAULT) {
        this.validationKey = validationKey;
        this.message = message;
    }

    protected getMessage(message: string, ...args: any[]){
        return stringFormat(message, ...args);
    }

    abstract hasErrors(value: any, ...args: any[]): Errors;
}