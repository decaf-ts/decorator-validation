import { Validator, ValidatorOptions } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";

export interface MinValidatorOptions extends ValidatorOptions {
  min: number | Date | string;
}

/**
 * @summary Min Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#MIN}
 *
 * @class MinValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.MIN)
export class MinValidator extends Validator<MinValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.MIN) {
    super(message, "number", "Date", "string");
  }

  /**
   * @summary Validates Model
   *
   * @param {string} value
   * @param {MaxValidatorOptions} options
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: number | Date | string,
    options: MinValidatorOptions
  ): string | undefined {
    if (typeof value === "undefined") return;

    let { min } = options;
    if (value instanceof Date && !(min instanceof Date)) {
      min = new Date(min);
      if (Number.isNaN(min.getDate()))
        throw new Error("Invalid Min param defined");
    }
    return value < min
      ? this.getMessage(options.message || this.message, min)
      : undefined;
  }
}
