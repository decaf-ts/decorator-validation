/**
 * @namespace decorator-validation.validation
 * @memberOf decorator-validation
 */

export * as Decorators from './decorators';
export * from './decorators';
export * from './types';
export * from './validation';
export * from './constants';
export * as Validators from './Validators';
export * from './Validators';
import {ValidatorRegistry} from './ValidatorRegistry';

/**
 * @constant ValidatorRegistryImp
 * @memberOf decorator-validation.validation
 */
export const ValidatorRegistryImp = ValidatorRegistry;
