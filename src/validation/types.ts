import Validator from "./Validators/Validator";
import ModelErrorDefinition from "../Model/ModelErrorDefinition";

/**
 * @memberOf Validation
 * @typedef Errors
 */
export type Errors = string | undefined;

/**
 * @memberOf Validation
 * @interface ValidatorRegistry
 */
export interface IValidatorRegistry {
    getKeys(): string[];
    register<T extends Validator>(...validator: (T | ValidatorDefinition)[]) : void;
    getValidator<T extends Validator>(name: string): T | undefined;
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
