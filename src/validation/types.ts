import { DecoratorMetadata } from "@decaf-ts/reflection";
import { Constructor } from "../model";
import { ValidationKeys, Validator } from "./Validators";
import { IRegistry } from "../utils";

/**
 * @summary Type for validation decorator metadata
 * @memberOf module:decorator-validation.Reflection
 * @category Reflection
 */
export type ValidationMetadata = {
  [indexer: string]: any;
  args?: any[];
  message: string;
  types?: string[];
};

/**
 * @summary Type for a validator property decorator definition
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export type ValidationPropertyDecoratorDefinition = {
  prop: string | symbol;
  decorators: ValidationDecoratorDefinition[];
};

/**
 * @summary Type for a validator decorator definition
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export type ValidationDecoratorDefinition = DecoratorMetadata & {
  props: ValidationElementDefinition;
};

/**
 * @summary Type for a validator element metadata
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export type ValidationElementDefinition = {
  [indexer: string]: any;

  value?: string | number;
  message: string;
  types?: string[];
};

/**
 * @summary Type for a model errors
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export type ModelErrors = Record<string, Record<string, string | undefined>>;

/**
 * @summary Util type for {@link Validator} configuration
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export type ValidatorDefinition = {
  validator: Constructor<Validator>;
  validationKey: string;
  save: boolean;
};

/**
 * @summary Base API for a {@link Validator} registry
 *
 * @interface ValidatorRegistry
 * @extends IRegistry
 *
 * @category Validation
 */
export interface IValidatorRegistry<T extends Validator> extends IRegistry<T> {
  /**
   * @summary retrieves the custom keys
   * @method
   */
  getCustomKeys(): Record<string, string>;

  /**
   * @summary Retrieves the Registered validator keys
   * @return {string[]} the registered validators keys
   * @method
   */
  getKeys(): string[];

  /**
   * @summary Registers the provided validators onto the registry
   *
   * @typedef T extends Validator
   * @param {T[] | ValidatorDefinition[]} validator
   * @method
   */
  register<T extends Validator>(
    ...validator: (T | ValidatorDefinition)[]
  ): void;

  /**
   * @summary Retrieves the Validator constructor if registered
   *
   * @typedef T extends Validator
   * @param {string} key one of the {@link ValidationKeys}
   * @return {Validator | undefined} the registered Validator or undefined if there is nono matching the provided key
   * @method
   */
  get<T extends Validator>(key: string): T | undefined;
}

export type ValidatorOptions = {
  message?: string;
};

export interface URLValidatorOptions extends ValidatorOptions {
  types: string | string[] | { name: string };
}

export interface TypeValidatorOptions extends ValidatorOptions {
  types: string | string[] | { name: string };
}

export interface StepValidatorOptions extends ValidatorOptions {
  [ValidationKeys.STEP]: number | string;
}

export interface PatternValidatorOptions extends ValidatorOptions {
  [ValidationKeys.PATTERN]?: RegExp | string;
}

export interface MinValidatorOptions extends ValidatorOptions {
  [ValidationKeys.MIN]: number | Date | string;
}

export interface MinLengthValidatorOptions extends ValidatorOptions {
  [ValidationKeys.MIN_LENGTH]: number;
}

export interface MaxValidatorOptions extends ValidatorOptions {
  [ValidationKeys.MAX]: number | Date | string;
}

export interface MaxLengthValidatorOptions extends ValidatorOptions {
  [ValidationKeys.MAX_LENGTH]: number;
}

export interface ListValidatorOptions extends ValidatorOptions {
  clazz: string[];
}

export interface DateValidatorOptions extends ValidatorOptions {
  [ValidationKeys.FORMAT]?: string;
}
