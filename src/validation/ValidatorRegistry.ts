import {ValidatorDefinition, IValidatorRegistry} from './types';
import Validator from "./Validators/Validator";

export class ValidatorRegistry implements IValidatorRegistry{
    private cache: any = {};

    constructor(...validators: (ValidatorDefinition | Validator)[]){
        this.register(...validators);
    }

    getKeys(): string[]{
        return Object.keys(this.cache);
    }

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