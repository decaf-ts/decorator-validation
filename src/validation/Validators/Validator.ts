import {checkTypes, ModelKeys, stringFormat} from "../../utils";
import {Errors} from "../types";
import {DEFAULT_ERROR_MESSAGES} from "./constants";

/**
 * @summary Base Implementation for Validators
 * @description Provides the underlying functionality for {@link Validator}s
 *
 * @param {string} validationKey the key to register the validator under
 * @param {string} [message] the error message. Defaults to {@link DEFAULT_ERROR_MESSAGES#DEFAULT}
 * @param {string[]} [acceptedTypes] defines the value types this validator can validate
 *
 * @class Validator
 * @abstract
 * @category Validators
 */
export abstract class Validator{
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

    /**
     * @summary builds the error message
     * @param {string} message
     * @param {any[]} args
     * @protected
     */
    protected getMessage(message: string, ...args: any[]){
        return stringFormat(message, ...args);
    }

    /**
     * @summary Validates type
     * @param {any} unbound
     * @private
     */
    private checkTypeAndHasErrors(unbound: (value: string, ...args: any[]) => Errors){
        return function(this: Validator, value: any, ...args: any[]): Errors {
            if (value === undefined || !this.acceptedTypes)
                return unbound(value, ...args);
            if (!checkTypes(value, this.acceptedTypes))
                return this.getMessage(DEFAULT_ERROR_MESSAGES.TYPE, this.acceptedTypes.join(', '), typeof value);
            return unbound(value, ...args);
        }.bind(this);
    }

    /**
     * @summary Validates an attribute
     * @param {any} value
     * @param {any[]} args
     *
     * @abstract
     *
     * @see Model#hasErrors
     */
    public abstract hasErrors(value: any, ...args: any[]): Errors;
}