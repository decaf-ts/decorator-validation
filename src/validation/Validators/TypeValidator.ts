import {Errors} from "../types";
import {Validator} from "./Validator";
import {evaluateDesignTypes} from "../../utils";
import {DEFAULT_ERROR_MESSAGES} from "./constants";
import {ModelKeys} from "../../utils/constants";

/**
 * @summary Required Validator
 *
 * @class RequiredValidator
 * @extends Validator
 *
 * @category Validators
 */
export class TypeValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.TYPE){
        super(ModelKeys.TYPE, message);
    }

    /**
     * @summary Validates a model
     * @param {string} value
     * @param {string | string[] | {name: string}} types
     * @param {string} [message]
     *
     * @return Errors
     *
     * @override
     *
     * @see Validator#hasErrors
     */
    public hasErrors(value: any, types: string | string[] | {name: string}, message?: string): Errors {
        if (value === undefined)
            return; // Dont try and enforce type if undefined
        if (!evaluateDesignTypes(value, types))
            return this.getMessage(message || this.message,
                typeof types === 'string'
                    ? types
                    : (
                        Array.isArray(types)
                            ? types.join(', ')
                            : types.name), typeof value);
    }
}