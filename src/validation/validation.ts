import Model from "../Model/Model";
import {
    Errors,
    Registry,
    ValidationPropertyDecoratorDefinition,
    ValidatorDefinition,
    ModelErrors
} from "./types";
import {checkTypes, evaluateDesignTypes, getPropertyDecorators} from '../utils/utils'
import {ValidationKeys} from "./constants";
import Validator from "./Validators/Validator";
import ModelErrorDefinition from "../Model/ModelErrorDefinition";
import {ModelKeys} from "../Model";
import TypeValidator from "./Validators/TypeValidator";

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
        self.register = function(...validator: (Validator | ValidatorDefinition)[]) : void{
            validator.forEach(v => {
                if (v instanceof Validator){
                    if (v.validationKey in cache)
                        return;
                    cache[v.validationKey] = v;
                } else {
                    const {validationKey, validator} = v;
                    if (validationKey in cache)
                        return;
                    cache[validationKey] = validator;
                }
            });
        }

        /**
         *
         * @param validatorKey
         * @return {*}
         * @memberOf ValidatorRegistry
         */
        self.getValidator = function(validatorKey: string) : Validator | undefined{
            if (!(validatorKey in cache))
                return;

            const classOrInstance = cache[validatorKey];
            if (classOrInstance instanceof Validator)
                return classOrInstance;
            const constructor = classOrInstance.default || classOrInstance;
            const instance = new constructor();
            cache[validatorKey] = instance;
            return instance;
        }
    }()
    registry.register(...initial);
    return registry;
}

/**
 * @constant
 * @memberOf Validation
 */
export const ValidatorRegistry = ValRegistry({validator: TypeValidator, validationKey: ModelKeys.TYPE});

/**
 * Analyses the decorations of the properties and validates the obj according to them
 * @function validate
 * @memberOf Validation
 */
export function validate<T extends Model>(obj: T) : ModelErrorDefinition | undefined {
    const decoratedProperties: ValidationPropertyDecoratorDefinition[] = [];
    for (let prop in obj)
        if (obj.hasOwnProperty(prop))
            decoratedProperties.push(getPropertyDecorators(ValidationKeys.REFLECT, obj, prop));

    const result =  decoratedProperties.reduce((accum: undefined | ModelErrors, decoratedProperty: ValidationPropertyDecoratorDefinition) => {
        const {prop, decorators} = decoratedProperty;

        if (!decorators || !decorators.length)
            return accum;

        // @ts-ignore
        const defaultTypeDecorator: {key: string, props: {name: string}} = decorators[0];

        // tries to find any type decorators or other decorators that already enforce type (the ones with the allowed types property defined). if so, skip the default type verification
        if (decorators.find(d => {
            if (d.key === ValidationKeys.TYPE)
                return true;
            if (d.props.types?.find(t => t === defaultTypeDecorator.props.name))
                return true;
            return false;
        }))
            decorators.shift(); // remove the design:type decorator, since the type will already be checked

        const errs: {[indexer: string]: Errors} | undefined = decorators.reduce((acc: undefined | {[indexer: string]: Errors}, decorator: {key: string, props: {}}) => {
            const validator = ValidatorRegistry.getValidator(decorator.key);
            if (!validator){
                console.error(`Could not find Matching validator for ${decorator.key} for property ${String(decoratedProperty.prop)}`);
                return acc;
            }

            const err: Errors = validator.hasErrors(obj[prop.toString()], ...(decorator.key === ModelKeys.TYPE ? [decorator.props] : Object.values(decorator.props)));
            if (err){
                acc = acc || {};
                acc[decorator.key] = err;
            }

            return acc;
        }, undefined);

        if (errs){
            accum = accum || {};
            accum[decoratedProperty.prop.toString()] = errs;
        }

        return accum;
    }, undefined);
    return result ? new ModelErrorDefinition(result) : undefined;
}