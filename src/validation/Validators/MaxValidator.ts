import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { validator } from "./decorators";

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
export class MaxValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.MAX) {
    super(message, "number", "Date", "string");
  }

  /**
   * @summary Validates a Model
   *
   * @param {string} value
   * @param {number | Date | string} max
   * @param {string} [message]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: number | Date | string,
    max: number | Date | string,
    message?: string
  ): string | undefined {
    if (value === undefined) return;

    if (value instanceof Date && !(max instanceof Date)) {
      max = new Date(max);
      if (isNaN(max.getDate())) throw new Error("Invalid Max param defined");
    }

    return value > max
      ? this.getMessage(message || this.message, max)
      : undefined;
  }
}
