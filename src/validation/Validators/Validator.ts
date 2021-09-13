import {stringFormat} from "../../utils/utils";
import {Errors} from "../types";
import {DEFAULT_ERROR_MESSAGES} from "../constants";
import {checkTypes} from "../../utils/utils";

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
    readonly acceptedTypes?: string[];


    protected constructor(validationKey: string, message: string = DEFAULT_ERROR_MESSAGES.DEFAULT, ...acceptedTypes: string[])  {
        this.validationKey = validationKey;
        this.message = message;

        if (acceptedTypes.length)
            this.acceptedTypes = acceptedTypes;
        if (this.acceptedTypes)
            this.hasErrors = this.checkTypeAndHasErrors(this.hasErrors.bind(this));
    }

    protected getMessage(message: string, ...args: any[]){
        return stringFormat(message, ...args);
    }

    private checkTypeAndHasErrors(unbound: (value: string, ...args: any[]) => Errors){
        return function(this: Validator, value: any, ...args: any[]): Errors {
            if (value === undefined || !this.acceptedTypes)
                return unbound(value, ...args);
            if (!checkTypes(value, this.acceptedTypes))
                return this.getMessage(DEFAULT_ERROR_MESSAGES.TYPE, this.acceptedTypes.join(', '), typeof value);
            return unbound(value, ...args);
        }.bind(this);
    }

    public abstract hasErrors(value: any, ...args: any[]): Errors;
}