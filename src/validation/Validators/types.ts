import { Validator } from "./Validator";
import { IRegistry } from "../../utils/registry";
import { Constructor } from "../../model/types";

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
