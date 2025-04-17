import { Validator, ValidatorOptions } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";

export interface StepValidatorOptions extends ValidatorOptions {
  step: number | string;
}

/**
 * @summary Step Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#STEP}
 *
 * @class StepValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.STEP)
export class StepValidator extends Validator<StepValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.STEP) {
    super(message, "number", "string");
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {number} step
   * @param {StepValidatorOptions} options
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: number | string,
    options: StepValidatorOptions
  ): string | undefined {
    if (typeof value === "undefined") return;
    return Number(value) % Number(options.step) !== 0
      ? this.getMessage(options.message || this.message, options.step)
      : undefined;
  }
}
