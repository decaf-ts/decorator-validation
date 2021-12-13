import {stringFormat} from "../../utils/utils";
import {Errors} from "../types";
import {DEFAULT_ERROR_MESSAGES} from "../constants";
import {checkTypes} from "../../utils/utils";

/**
 * Base Implementation for Validators
 *
 * @class Validator
 * @abstract
 * @extends Validator
 *
 * @category Validators
 */
export default abstract class Validator{
    readonly validationKey: string;
    readonly message: string;
    readonly acceptedTypes?: string[];

    /**
     *
     * @param {string} validationKey
     * @param {string} [message]
     * @param {string[]} [acceptedTypes]
     * @protected
     * @constructor
     */
    protected constructor(validationKey: string, message: string = DEFAULT_ERROR_MESSAGES.DEFAULT, ...acceptedTypes: string[])  {
        this.validationKey = validationKey;
        this.message = message;

        if (acceptedTypes.length)
            this.acceptedTypes = acceptedTypes;
        if (this.acceptedTypes)
            this.hasErrors = this.checkTypeAndHasErrors(this.hasErrors.bind(this));
    }

    /**
     *
     * @param {string} message
     * @param {any[]} args
     * @protected
     *
     * @memberOf Validator
     */
    protected getMessage(message: string, ...args: any[]){
        return stringFormat(message, ...args);
    }

    /**
     *
     * @param {any} unbound
     * @private
     *
     * @memberOf Validator
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
     *
     * @param {any} value
     * @param {any[]} args
     *
     * @abstract
     * @memberOf validator
     *
     * @see Model#hasErrors
     */
    public abstract hasErrors(value: any, ...args: any[]): Errors;
}