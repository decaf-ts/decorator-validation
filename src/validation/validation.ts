import Model from "../Model/Model";
import {Errors, Registry} from "./types";
import {getPropertyDecorators} from '../utils'
import * as Validators from './Validators'
import {ValidationKeys} from "./constants";
import Validator from "./Validators/Validator";

/**
 * Returns
 * @return {*}
 * @constructor
 * @function ValRegistry
 * @memberOf Validation
 */
function ValRegistry(...initial: any[]) : Registry {
    // @ts-ignore
    const registry: Registry =  new function(){
        const cache: any = {};
        // @ts-ignore
        const self: any = this;

        /**
         *
         * @param validator
         * @memberOf ValidatorRegistry
         */
        self.register = function(...validator: any[]) : void{
            validator.forEach(v => {
                if (v instanceof Validator){
                    cache[v.validationKey] = v;
                } else {
                    // @ts-ignore
                    const constructorMethod = v.default || v;
                    // @ts-ignore
                    const instance: Validator = new constructorMethod();
                    cache[instance.validationKey] = instance;
                }
            });
        }

        /**
         *
         * @param validatorKey
         * @return {*}
         * @memberOf ValidatorRegistry
         */
        self.getValidator = function(validatorKey: string){
            if (!(validatorKey in cache))
                return;
            return cache[validatorKey];
        }
    }()
    registry.register(...initial);
    return registry;
}

/**
 * @constant
 * @memberOf Validation
 */
export const ValidatorRegistry = ValRegistry(...Object.values(Validators));

/**
 * Analyses the decorations of the properties and validates the obj according to them
 * @function validate
 * @memberOf Validation
 */
export function validate<T extends Model>(obj: T) : Errors{
    const decoratedProperties = [];
    for (let prop in obj)
        if (obj.hasOwnProperty(prop))
            decoratedProperties.push(getPropertyDecorators(ValidationKeys.REFLECT, obj, prop));

    return decoratedProperties.reduce((accum, decoratedProperty) => {
        const {prop, decorators} = decoratedProperty;
        if (!decorators || !decorators.length)
            return accum;

        const errs = decorators.reduce((acc, decorator: {key: string, props: {}}) => {
            const validator = ValidatorRegistry.getValidator(decorator.key);
            if (!validator){
                // @ts-ignore
                throw new Error(`Could not find Matching validator for ${decorator.key} for property ${decoratedProperty.prop}`)
            }

            // @ts-ignore
            const err = validator.hasErrors(obj[prop], ...Object.values(decorator.props));
            if (err){
                // @ts-ignore
                acc = acc || {};
                // @ts-ignore
                acc[decorator.key] = err;
            }

            return acc;
        }, undefined);

        if (errs){
            const propErrors = {
                property: decoratedProperty.prop,
                errors: errs
            }
            // @ts-ignore
            accum = accum || [];
            // @ts-ignore
            accum.push(propErrors);
        }

        return accum;
    }, undefined);
}