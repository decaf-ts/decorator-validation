import {ModelErrorDefinition} from "./ModelErrorDefinition";
import {Model} from "./Model";

/**
 * @summary Definition of a Model Constructor Argument
 *
 * @memberOf module:decorator-validation.Model
 * @category Model
 *
 * @see ModelConstructor
 */
export type ModelArg<T> = T | Record<string, any>

/**
 * @summary Definition of a Class Constructor
 * @description Generic type for Constructor functions
 *
 * @typedef Constructor
 *
 * @param {any[]} [args]
 * @memberOf module:decorator-validation.Model
 * @category Model
 */
export type Constructor<T> = {
    new(...args: any[]): T
}

/**
 * @summary Definition of a Model Constructor
 * @description Generic type for all Model Constructor functions
 *
 * @typedef ModelConstructor
 *
 * @param {ModelArg<T>} [model]
 * @param {any[]} [args]
 * @memberOf module:decorator-validation.Model
 * @category Construction
 */
export type ModelConstructor<T extends Model> = {
    new(model?: ModelArg<T>, ...args: any[]): T
}

/**
 * @summary Defines the Validation API for validatable models
 * @interface Validatable
 *
 * @category Validation
 */
export interface Validatable {
    /**
     * @summary Validates the model and returns the {@link ModelErrorDefinition} if any
     * @param {any} [args]
     *
     * @method
     */
    hasErrors(...args: any[]): ModelErrorDefinition | undefined;
}

/**
 * @summary Serializable interface
 *
 * @interface Serializable
 *
 * @category Serialization
 */
export interface Serializable {
    /**
     * @summary serializes the model
     * @method
     */
    serialize(): string;
}