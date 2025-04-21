import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { DateValidatorOptions } from "../types";

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
export class DateValidator extends Validator<DateValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.DATE) {
    super(message, Number.name, Date.name, String.name);
  }

  /**
   * @summary Validates a model
   *
   * @param {Date | string} value
   * @param {DateValidatorOptions} [options]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: Date | string,
    options: DateValidatorOptions = {}
  ): string | undefined {
    if (value === undefined) return;

    if (typeof value === "string") value = new Date(value);

    if (Number.isNaN(value.getDate())) {
      const { message = "" } = options;
      return this.getMessage(message || this.message);
    }
  }
}
