import Model from "../Model/Model";
import {
    Errors,
    ValidationPropertyDecoratorDefinition,
    ModelErrors, IValidatorRegistry
} from "./types";
import {ValidatorRegistry, ValidatorRegistry as ValidatorRegistryImp} from "./ValidatorRegistry";
import {getPropertyDecorators} from '../utils/utils'
import {ValidationKeys} from "./constants";
import ModelErrorDefinition from "../Model/ModelErrorDefinition";
import {ModelKeys} from "../Model";
import TypeValidator from "./Validators/TypeValidator";
import Validator from "./Validators/Validator";

let actingValidatorRegistry: IValidatorRegistry | undefined = undefined;

/**
 * Returns the current ValidatorRegistry
 * @function getValidatorRegistry
 * @return IValidatorRegistry, defaults to {@link ValidatorRegistryImp}
 * @memberOf Validation
 */
export function getValidatorRegistry(){
    if (!actingValidatorRegistry)
        actingValidatorRegistry = new ValidatorRegistryImp({validator: TypeValidator, validationKey: ModelKeys.TYPE});
    return actingValidatorRegistry;
}

/**
 * Returns the current ValidatorRegistry
 * @function getValidatorRegistry
 * @prop {IValidatorRegistry} validatorRegistry the new implementation of the validator Registry
 * @prop {function(Validator): Validator} [migrationHandler] the method to map the validator if required;
 * @memberOf Validation
 */
export function setValidatorRegistry(validatorRegistry: IValidatorRegistry, migrationHandler?: (validator: Validator) => Validator){
    if (migrationHandler && actingValidatorRegistry)
        actingValidatorRegistry.getKeys().forEach(k => {
            const validator = validatorRegistry.getValidator(k);
            if (validator)
                validatorRegistry.register(migrationHandler(validator))
        });
    actingValidatorRegistry = validatorRegistry;
}

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
            const validator = getValidatorRegistry().getValidator(decorator.key);
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