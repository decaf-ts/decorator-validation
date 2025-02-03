import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { validator } from "./decorators";

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
export class StepValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.STEP) {
    super(message, "number", "string");
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {number} step
   * @param {string} [message]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: number | string,
    step: number | string,
    message?: string
  ): string | undefined {
    if (typeof value === "undefined") return;
    return Number(value) % Number(step) !== 0
      ? this.getMessage(message || this.message, step)
      : undefined;
  }
}
