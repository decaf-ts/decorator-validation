import { Constructor } from "@decaf-ts/decoration";
import { ValidationKeys, Validator } from "./Validators";
import { IRegistry } from "../utils";

/**
 * @description Type definition for metadata used by validation decorators
 * @summary Defines the structure of metadata attached to properties by validation decorators.
 * This metadata is used during validation to determine validation rules and error messages.
 *
 * @property {any[]} [args] - Optional arguments for the validator
 * @property {string} message - Error message to display when validation fails
 * @property {string[]} [types] - Array of type names that the property can have
 * @property {boolean} async - Indicates whether the validator associated with the decorator performs asynchronous validation logic.
 * Use `true` when the validator returns a Promise, and `false` when the validation is synchronous.
 *
 * @typedef {Object} ValidationMetadata
 * @memberOf module:decorator-validation
 * @category Validation
 */
export type ValidationMetadata = {
  [indexer: string]: any;
  args?: any[];
  message: string;
  types?: string[];
  async: boolean;
};

/**
 * @description Type definition for property-level validation decorator configuration
 * @summary Defines the structure that associates a property with its validation decorators.
 * This type is used to track which decorators are applied to a specific property during validation.
 *
 * @property {string|symbol} prop - The property name or symbol that the decorators are applied to
 * @property {ValidationDecoratorDefinition[]} decorators - Array of decorator definitions applied to the property
 *
 * @typedef {Object} ValidationPropertyDecoratorDefinition
 * @memberOf module:decorator-validation
 * @category Validation
 */
export type ValidationPropertyDecoratorDefinition = {
  prop: string | symbol;
  decorators: ValidationDecoratorDefinition[];
  async?: boolean;
};

/**
 * @description Type definition for individual validation decorator metadata
 * @summary Extends the base DecoratorMetadata type with validation-specific properties.
 * This type represents the metadata for a single validation decorator applied to a property.
 *
 * @property {ValidationElementDefinition} props - The validation element properties and configuration
 *
 * @typedef {Object} ValidationDecoratorDefinition
 * @memberOf module:decorator-validation
 * @category Validation
 */
export type ValidationDecoratorDefinition = {
  props: ValidationElementDefinition;
  async?: boolean;
};

/**
 * @summary Type for a validator element metadata
 * @memberOf module:decorator-validation
 * @category Validation
 */
export type ValidationElementDefinition = {
  [indexer: string]: any;

  value?: string | number;
  message: string;
  description: string;
};

/**
 * @summary Type for a model errors
 * @memberOf module:decorator-validation
 * @category Validation
 */
export type ModelErrors = Record<string, Record<string, string | undefined>>;

/**
 * @summary Util type for {@link Validator} configuration
 * @memberOf module:decorator-validation
 * @category Validation
 */
export type ValidatorDefinition = {
  validator: Constructor<Validator>;
  validationKey: string;
  save: boolean;
};

/**
 * @description Interface for a registry that manages validator instances
 * @summary Defines the contract for a registry that stores and retrieves validators.
 * The registry is responsible for maintaining a collection of validators and providing
 * access to them by key.
 *
 * @interface IValidatorRegistry
 * @template T Type of validator, must extend Validator
 * @extends IRegistry<T>
 * @memberOf module:decorator-validation
 * @category Validation
 */
export interface IValidatorRegistry<T extends Validator> extends IRegistry<T> {
  /**
   * @description Retrieves custom validation keys defined in the registry
   * @summary Returns a mapping of custom validation keys to their corresponding standard keys.
   * This allows for aliasing validation keys for specific use cases.
   *
   * @return {Record<string, string>} Object mapping custom keys to standard validation keys
   */
  getCustomKeys(): Record<string, string>;

  /**
   * @description Gets all registered validator keys
   * @summary Returns an array of all validation keys that have registered validators.
   *
   * @return {string[]} Array of registered validator keys
   */
  getKeys(): string[];

  /**
   * @description Registers one or more validators with the registry
   * @summary Adds validators to the registry, making them available for validation operations.
   * Validators can be provided as instances or as validator definitions.
   *
   * @param {...(T|ValidatorDefinition)} validator - Validator instances or definitions to register
   * @return {void}
   */
  register<T extends Validator>(
    ...validator: (T | ValidatorDefinition)[]
  ): void;

  /**
   * @description Retrieves a validator by its key
   * @summary Looks up a validator in the registry using its validation key.
   * Returns the validator if found, or undefined if no validator is registered for the key.
   *
   * @param {string} key - The validation key to look up, typically one of the {@link ValidationKeys}
   * @return {T|undefined} The registered validator or undefined if none matches the provided key
   */
  get<T extends Validator>(key: string): T | undefined;
}

/**
 * @description Base options type for all validators
 * @summary Defines the common properties available to all validators
 * @interface ValidatorOptions
 * @property {string} [message] - Custom error message to display when validation fails
 * @property {boolean} async - Indicates whether the validator associated with the decorator performs asynchronous validation logic.
 * Use `true` when the validator returns a Promise, and `false` when the validation is synchronous.
 * @category Validation
 */
export interface ValidatorOptions {
  message?: string;
  description?: string;
  async?: boolean;
}

/**
 * @description URL validation options interface
 * @summary Defines options for URL validation, including allowed URL types
 * @interface URLValidatorOptions
 * @property {(string|string[]|{ name: string })} types - Specifies the allowed URL types or patterns
 * @category Validation
 */
export interface URLValidatorOptions extends ValidatorOptions {
  types: string | string[] | { name: string };
}

/**
 * @description Type validation options interface
 * @summary Defines options for type validation, specifying allowed types
 * @interface TypeValidatorOptions
 * @property {(string|string[]|{ name: string })} type - Specifies the allowed data types
 * @memberOf module:decorator-validation
 * @category Validation
 */
export interface TypeValidatorOptions extends ValidatorOptions {
  type: string | string[] | { name: string };
  customTypes?: (string | (() => string))[];
}

/**
 * @description Step validation options interface
 * @summary Defines options for step validation, specifying the step increment
 * @interface StepValidatorOptions
 * @property {(number|string)} [ValidationKeys.STEP] - The step value for numerical validation
 * @memberOf module:decorator-validation
 * @category Validation
 */
export interface StepValidatorOptions extends ValidatorOptions {
  [ValidationKeys.STEP]: number | string;
  types?: string[];
}

/**
 * @description Pattern validation options interface
 * @summary Defines options for pattern validation using regular expressions
 * @interface PatternValidatorOptions
 * @property {(RegExp|string)} [ValidationKeys.PATTERN] - The pattern to match against
 * @memberOf module:decorator-validation
 * @category Validation
 */
export interface PatternValidatorOptions extends ValidatorOptions {
  [ValidationKeys.PATTERN]?: RegExp | string;
  types?: string[];
}

/**
 * @description Minimum value validation options interface
 * @summary Defines options for minimum value validation
 * @interface MinValidatorOptions
 * @property {(number|Date|string)} [ValidationKeys.MIN] - The minimum allowed value
 * @memberOf module:decorator-validation
 * @category Validation
 */
export interface MinValidatorOptions extends ValidatorOptions {
  [ValidationKeys.MIN]: number | Date | string;
  types?: string[];
}

/**
 * @description Minimum length validation options interface
 * @summary Defines options for minimum length validation
 * @interface MinLengthValidatorOptions
 * @property {number} [ValidationKeys.MIN_LENGTH] - The minimum allowed length
 * @memberOf module:decorator-validation
 * @category Validation
 */
export interface MinLengthValidatorOptions extends ValidatorOptions {
  [ValidationKeys.MIN_LENGTH]: number;
  types?: string[];
}

/**
 * @description Maximum value validation options interface
 * @summary Defines options for maximum value validation
 * @interface MaxValidatorOptions
 * @property {(number|Date|string)} [ValidationKeys.MAX] - The maximum allowed value
 * @memberOf module:decorator-validation
 * @category Validation
 */
export interface MaxValidatorOptions extends ValidatorOptions {
  [ValidationKeys.MAX]: number | Date | string;
  types?: string[];
}

/**
 * @description Maximum length validation options interface
 * @summary Defines options for maximum length validation
 * @interface MaxLengthValidatorOptions
 * @property {number} [ValidationKeys.MAX_LENGTH] - The maximum allowed length
 * @memberOf module:decorator-validation
 * @category Validation
 */
export interface MaxLengthValidatorOptions extends ValidatorOptions {
  [ValidationKeys.MAX_LENGTH]: number;
  types?: string[];
}

/**
 * @description List validation options interface
 * @summary Defines options for list validation
 * @interface ListValidatorOptions
 * @property {string[]} clazz - Array of allowed class names or types
 * @memberOf module:decorator-validation
 * @category Validation
 */
export interface ListValidatorOptions extends ValidatorOptions {
  clazz: (string | (() => Constructor<any>))[];
}

/**
 * @description Unique validation options interface
 * @summary Defines options for unique validation
 * @interface UniqueValidatorOptions
 * @property {string[]} unique - Array of allowed class names or types
 * @memberOf module:decorator-validation
 * @category Validation
 */
export interface UniqueValidatorOptions extends ValidatorOptions {
  [ValidationKeys.UNIQUE]: string[];
}

/**
 * @description Date validation options interface
 * @summary Defines options for date validation
 * @interface DateValidatorOptions
 * @property {string} [ValidationKeys.FORMAT] - The expected date format pattern
 * @memberOf module:decorator-validation
 * @category Validation
 */
export interface DateValidatorOptions extends ValidatorOptions {
  [ValidationKeys.FORMAT]?: string;
}

export interface ComparisonValidatorOptions extends ValidatorOptions {
  label?: string;
}

export interface EqualsValidatorOptions extends ComparisonValidatorOptions {
  [ValidationKeys.EQUALS]: string;
}

export interface DiffValidatorOptions extends ComparisonValidatorOptions {
  [ValidationKeys.DIFF]: string;
}

export interface LessThanValidatorOptions extends ComparisonValidatorOptions {
  [ValidationKeys.LESS_THAN]: string;
}

export interface LessThanOrEqualValidatorOptions
  extends ComparisonValidatorOptions {
  [ValidationKeys.LESS_THAN_OR_EQUAL]: string;
}

export interface GreaterThanValidatorOptions
  extends ComparisonValidatorOptions {
  [ValidationKeys.GREATER_THAN]: string;
}

export interface GreaterThanOrEqualValidatorOptions
  extends ComparisonValidatorOptions {
  [ValidationKeys.GREATER_THAN_OR_EQUAL]: string;
}
