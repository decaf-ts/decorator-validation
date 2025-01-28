import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { validator } from "./decorators";

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
export class MinValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.MIN) {
    super(message, "number", "Date", "string");
  }

  /**
   * @summary Validates Model
   *
   * @param {string} value
   * @param {number | Date | string} min
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
    min: number | Date | string,
    message?: string
  ): string | undefined {
    if (value === undefined) return;

    if (value instanceof Date && !(min instanceof Date)) {
      min = new Date(min);
      if (Number.isNaN(min.getDate()))
        throw new Error("Invalid Min param defined");
    }
    return value < min
      ? this.getMessage(message || this.message, min)
      : undefined;
  }
}
