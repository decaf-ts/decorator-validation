import { Validator } from "./Validators/Validator";
import { IValidatorRegistry, ValidatorDefinition } from "./Validators/types";
import { ValidatorRegistry } from "./Validators/ValidatorRegistry";
import { ValidationKeys } from "./Validators/constants";

/**
 * @summary Static class acting as a namespace for the Validation
 *
 * @class Validation
 * @static
 *
 * @category Validation
 */
export class Validation {
  private static actingValidatorRegistry?: IValidatorRegistry<Validator> =
    undefined;

  private constructor() {}

  /**
   * @summary Defines the acting ValidatorRegistry
   *
   * @param {IValidatorRegistry} validatorRegistry the new implementation of the validator Registry
   * @param {function(Validator): Validator} [migrationHandler] the method to map the validator if required;
   */
  static setRegistry(
    validatorRegistry: IValidatorRegistry<Validator>,
    migrationHandler?: (validator: Validator) => Validator
  ) {
    if (migrationHandler && Validation.actingValidatorRegistry)
      Validation.actingValidatorRegistry.getKeys().forEach((k) => {
        const validator = validatorRegistry.get(k);
        if (validator) validatorRegistry.register(migrationHandler(validator));
      });
    Validation.actingValidatorRegistry = validatorRegistry;
  }

  /**
   * @summary Returns the current ValidatorRegistry
   *
   * @return IValidatorRegistry, defaults to {@link ValidatorRegistry}
   */
  private static getRegistry() {
    if (!Validation.actingValidatorRegistry)
      Validation.actingValidatorRegistry = new ValidatorRegistry();
    return Validation.actingValidatorRegistry;
  }

  /**
   * @summary Retrieves a validator
   *
   * @param {string} validatorKey one of the {@link ValidationKeys}
   * @return {Validator | undefined} the registered Validator or undefined if there is nono matching the provided key
   */
  static get<T extends Validator>(validatorKey: string): T | undefined {
    return Validation.getRegistry().get(validatorKey);
  }

  /**
   * @summary Registers the provided validators onto the registry
   *
   * @param {T[] | ValidatorDefinition[]} validator
   */
  static register<T extends Validator>(
    ...validator: (ValidatorDefinition | T)[]
  ): void {
    return Validation.getRegistry().register(...validator);
  }

  /**
   * @summary Builds the key to store as Metadata under Reflections
   * @description concatenates {@link ValidationKeys#REFLECT} with the provided key
   *
   * @param {string} key
   */
  static key(key: string) {
    return ValidationKeys.REFLECT + key;
  }
}
