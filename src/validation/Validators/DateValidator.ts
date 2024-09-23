import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { Errors } from "../types";
import { validator } from "./decorators";

/**
 * @summary Date Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#DATE}
 *
 * @class DateValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.DATE)
export class DateValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.DATE) {
    super(message, Number.name, Date.name, String.name);
  }

  /**
   * @summary Validates a model
   *
   * @param {Date | string} value
   * @param {string} format
   * @param {string} [message]
   *
   * @return Errors
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: Date | string,
    format: string,
    message?: string,
  ): Errors {
    if (value === undefined) return;

    if (typeof value === "string") value = new Date(value);

    if (isNaN(value.getDate())) return this.getMessage(message || this.message);
  }
}
