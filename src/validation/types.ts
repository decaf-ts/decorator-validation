/**
 * @summary Validator Error type
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export type Errors = string | undefined;

/**
 * @summary Type for validation decorator metadata
 * @memberOf module:decorator-validation.Reflection
 * @category Reflection
 */
export type ValidationMetadata = {
  message: string;
  args?: any[];
};

/**
 * @summary Type for decorator metadata
 * @memberOf module:decorator-validation.Reflection
 * @category Reflection
 */
export type DecoratorMetadata = { key: string; props: Record<string, any> };

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
export type ModelErrors = {
  [indexer: string]: { [indexer: string]: Errors };
};
