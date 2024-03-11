import { ValidatorDefinition } from "./types";
import { IValidatorRegistry } from "./types";
import type { Validator } from "./Validator";

/**
 * @summary Duck typing for Validators
 * @function isValidator
 * @param val
 */
export function isValidator(val: any) {
  return val.constructor && val["hasErrors"];
}

/**
 * @summary Base Implementation of a Validator Registry
 *
 * @prop {Validator[]} [validators] the initial validators to register
 *
 * @class ValidatorRegistry
 * @implements IValidatorRegistry<T>
 *
 * @category Validation
 */
export class ValidatorRegistry<T extends Validator>
  implements IValidatorRegistry<T>
{
  private cache: any = {};
  private customKeyChache: Record<string, string>;

  constructor(...validators: (ValidatorDefinition | Validator)[]) {
    this.customKeyChache = {};
    this.register(...validators);
  }

  /**
   * @summary retrieves the custom keys
   */
  getCustomKeys(): { [indexer: string]: string } {
    return Object.assign({}, this.customKeyChache);
  }

  /**
   * @summary retrieves the registered validators keys
   */
  getKeys(): string[] {
    return Object.keys(this.cache);
  }

  /**
   * @summary Retrieves a validator
   *
   * @param {string} validatorKey one of the {@link ValidationKeys}
   * @return {Validator | undefined} the registered Validator or undefined if there is nono matching the provided key
   */
  get<T extends Validator>(validatorKey: string): T | undefined {
    if (!(validatorKey in this.cache)) return undefined;

    const classOrInstance = this.cache[validatorKey];
    if (isValidator(classOrInstance)) return classOrInstance as T;
    const constructor = classOrInstance.default || classOrInstance;
    const instance = new constructor();
    this.cache[validatorKey] = instance;
    return instance;
  }

  /**
   * @summary Registers the provided validators onto the registry
   *
   * @param {T[] | ValidatorDefinition[]} validator
   */
  register<T extends Validator>(
    ...validator: (ValidatorDefinition | T)[]
  ): void {
    validator.forEach((v) => {
      if (isValidator(v)) {
        if (v.validationKey in this.cache) return;
        this.cache[v.validationKey] = v;
      } else {
        const { validationKey, validator, save } = v as ValidatorDefinition;
        if (validationKey in this.cache) return;
        this.cache[validationKey] = validator;
        if (!save) return;
        const obj: Record<string, string> = {};
        obj[validationKey.toUpperCase()] = validationKey;

        this.customKeyChache = Object.assign({}, this.customKeyChache, obj);
      }
    });
  }
}
