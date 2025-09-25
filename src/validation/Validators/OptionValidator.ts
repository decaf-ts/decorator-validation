import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { EnumValidatorOptions } from "../types";

/**
 * @summary Option Validator
 * @description Validates properties against an object or a list of accepted values
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#ENUM}
 *
 * @class OptionValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.ENUM)
export class OptionValidator extends Validator<EnumValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.ENUM) {
    super(message);
  }

  /**
   *
   * @param {any[] | Record<any, any>} value
   * @param {EnumValidatorOptions} options
   *
   * @return {string | undefined}
   *
   * @memberOf module:decorator-validation
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: any,
    options: EnumValidatorOptions
  ): string | undefined {
    if (typeof value === "undefined") return;

    if (Array.isArray(options.enum))
      return !options.enum.includes(value)
        ? this.getMessage(options.message || this.message, options.enum)
        : undefined;
    if (typeof options.enum === "object") {
      const keys = Object.keys(options.enum);
      for (const key of keys)
        if ((options.enum as any)[key] === value) return undefined;
      return this.getMessage(
        options.message || this.message,
        Object.values(options.enum)
      );
    }
  }
}
