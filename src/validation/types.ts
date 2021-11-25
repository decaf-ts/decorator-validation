import Validator from "./Validators/Validator";
import ModelErrorDefinition from "../Model/ModelErrorDefinition";
import {ValidationKeys} from "./constants";
import {IRegistry} from "../utils/registry";
import {ValidatorRegistry} from "./ValidatorRegistry";

/**
 * @memberOf validation
 * @typedef Errors
 */
export type Errors = string | undefined;

/**
 * @memberOf validation
 * @interface ValidatorRegistry
 */
export interface IValidatorRegistry<T extends Validator> extends IRegistry<T>{
    /**
     * @return {string[]} the registered validators keys
     */
    getKeys(): string[];

    /**
     * Registers the provided validators onto the registry
     *
     * @typedef T extends Validator
     * @param {T[] | ValidatorDefinition[]} validator
     */
    register<T extends Validator>(...validator: T[] | ValidatorDefinition[]) : void;

    /**
     * @typedef T extends Validator
     * @param {string} key one of the {@link ValidationKeys}
     * @return {Validator | undefined} the registered Validator or undefined if there is nono matching the provided key
     */
    get<T extends Validator>(key: string): T | undefined;
}

export type ValidatorDefinition = {
    validator: {new(): Validator},
    validationKey: string
}

/**
 * @interface Validatable
 * @memberOf Validation
 */
export default interface Validatable {
    /**
     * @param {any} [args]
     * @memberOf Validatable
     */
    hasErrors(...args: any[]) : ModelErrorDefinition | undefined;
}

export type ValidationPropertyDecoratorDefinition = {
    prop: string | symbol,
    decorators: ValidationDecoratorDefinition[]
}

export type ValidationDecoratorDefinition = {
    key: string,
    props: ValidationElementDefinition
}

export type ValidationElementDefinition = {
    value?: string | number,
    message: string
    types?: string[],
}

export type ModelErrors = {
    [indexer: string]: {[indexer: string]: Errors, }
}
