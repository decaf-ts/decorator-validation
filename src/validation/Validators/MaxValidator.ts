import { Validator, ValidatorOptions } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";

export interface MaxValidatorOptions extends ValidatorOptions {
  max: number | Date | string;
}

/**
 * @summary Max Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#MAX}
 *
 * @class MaxValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.MAX)
export class MaxValidator extends Validator<MaxValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.MAX) {
    super(message, "number", "Date", "string");
  }

  /**
   * @summary Validates a Model
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
    options: MaxValidatorOptions
  ): string | undefined {
    if (typeof value === "undefined") return;

    let { max } = options;
    if (value instanceof Date && !(max instanceof Date)) {
      max = new Date(max);
      if (Number.isNaN(max.getDate()))
        throw new Error("Invalid Max param defined");
    }

    return value > max
      ? this.getMessage(options.message || this.message, max)
      : undefined;
  }
}
