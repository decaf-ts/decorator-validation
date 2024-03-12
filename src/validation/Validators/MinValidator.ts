import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { Errors } from "../types";
import { ValidationError } from "../../errors/ValidationError";

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
export class MinValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.MIN) {
    super(ValidationKeys.MIN, message, "number", "Date", "string");
  }

  /**
   * @summary Validates Model
   *
   * @param {string} value
   * @param {number | Date | string} min
   * @param {string} [message]
   *
   * @return Errors
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: number | Date | string,
    min: number | Date | string,
    message?: string,
  ): Errors {
    if (value === undefined) return;

    if (value instanceof Date && !(min instanceof Date)) {
      min = new Date(min);
      if (isNaN(min.getDate()))
        throw new ValidationError(`Invalid Min param defined`);
    }
    return value < min
      ? this.getMessage(message || this.message, min)
      : undefined;
  }
}
