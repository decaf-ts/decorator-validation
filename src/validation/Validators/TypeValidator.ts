import Validator from "./Validator";
import {DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";
import {ModelKeys} from "../../Model";
import {checkType, checkTypes} from "../../utils";

/**
 * Required Validator
 *
 * @class RequiredValidator
 * @extends Validator
 * @memberOf Validators
 */
export default class TypeValidator extends Validator {
    constructor(message: string = DEFAULT_ERROR_MESSAGES.TYPE){
        super(ModelKeys.TYPE, message);
    }

    private checkType(value: any, typeName: string, message?: string){
        if (!checkType(value, typeName))
            return this.getMessage(message || this.message, typeName, typeof value);
    }

    public hasErrors(value: any, types: string | string[] | {name: string}, message?: string): Errors {
        if (value === undefined)
            return; // Dont try and enforce type if undefined

        switch(typeof types){
            case 'string':
                return this.checkType(value, types, message);
            case "object":
                if (Array.isArray(types))
                    { // @ts-ignore
                        if (!checkTypes(value, types))
                        { // @ts-ignore
                            return this.getMessage(message || this.message, types.join(', '), typeof value);
                        }
                    }
                break;
            case "function":
                // @ts-ignore
                if (types.name && types.name !== 'Object')
                    { // @ts-ignore
                        return this.checkType(value, types.name.toLowerCase(), message);                    }
        }
    }
}