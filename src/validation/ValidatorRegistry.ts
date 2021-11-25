import {ValidatorDefinition, IValidatorRegistry} from './types';
import Validator from "./Validators/Validator";
import {ValidationKeys} from "./constants";

/**
 * Base Implementation of a Validator Registry
 *
 * @prop {Validator[]} [validators] the initial validators to register
 *
 * @class ValidatorRegistry
 * @namespace validation
 * @memberOf decorator-validation
 */
export class ValidatorRegistry implements IValidatorRegistry{
    private cache: any = {};

    constructor(...validators: (ValidatorDefinition | Validator)[]){
        this.register(...validators);
    }

    /**
     * @return {string[]} the registered validators keys
     */
    getKeys(): string[]{
        return Object.keys(this.cache);
    }

    /**
     * @typedef T extends Validator
     * @param {string} validatorKey one of the {@link ValidationKeys}
     * @return {Validator | undefined} the registered Validator or undefined if there is nono matching the provided key
     */
    getValidator<T extends Validator>(validatorKey: string): T | undefined {
        if (!(validatorKey in this.cache))
            return undefined;

        const classOrInstance = this.cache[validatorKey];
        if (classOrInstance instanceof Validator)
            return classOrInstance as T;
        const constructor = classOrInstance.default || classOrInstance;
        const instance = new constructor();
        this.cache[validatorKey] = instance;
        return instance;
    }

    /**
     * Registers the provided validators onto the registry
     *
     * @typedef T extends Validator
     * @param {T[] | ValidatorDefinition[]} validator
     */
    register<T extends Validator>(...validator: (ValidatorDefinition | T)[]): void {
        validator.forEach(v => {
            if (v instanceof Validator){
                if (v.validationKey in this.cache)
                    return;
                this.cache[v.validationKey] = v;
            } else {
                const {validationKey, validator} = v;
                if (validationKey in this.cache)
                    return;
                this.cache[validationKey] = validator;
            }
        });
    }
}