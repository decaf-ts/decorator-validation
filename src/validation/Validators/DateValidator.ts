import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { DateValidatorOptions } from "../types";

/**
 * @description Validator for checking if a value is a valid date
 * @summary The DateValidator checks if a value is a valid date object or a string that can be converted to a valid date.
 * It validates that the value represents a real date and not an invalid date like "2023-02-31".
 * @param {string} [message] - Custom error message to display when validation fails, defaults to {@link DEFAULT_ERROR_MESSAGES#DATE}
 * @class DateValidator
 * @extends Validator
 *
 * @category Validators
 * @example
 * ```typescript
 * // Create a date validator with default error message
 * const dateValidator = new DateValidator();
 *
 * // Create a date validator with custom error message
 * const customDateValidator = new DateValidator("Please enter a valid date");
 *
 * // Validate a date
 * const result = dateValidator.hasErrors(new Date()); // undefined (valid)
 * const invalidResult = dateValidator.hasErrors("not a date"); // Returns error message (invalid)
 * ```
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant V as DateValidator
 *
 *   C->>V: new DateValidator(message)
 *   C->>V: hasErrors(value, options)
 *   alt value is undefined
 *     V-->>C: undefined (valid)
 *   else value is string
 *     V->>V: Convert to Date
 *   end
 *   alt Date is invalid (NaN)
 *     V-->>C: Error message
 *   else Date is valid
 *     V-->>C: undefined (valid)
 *   end
 */
@validator(ValidationKeys.DATE)
export class DateValidator extends Validator<DateValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.DATE) {
    super(message, Number.name, Date.name, String.name);
  }

  /**
   * @description Checks if the provided value is a valid date
   * @summary Validates that the given value is a valid date. If the value is a string,
   * it attempts to convert it to a Date object. Returns an error message if the date is invalid,
   * or undefined if the date is valid or if the value is undefined.
   *
   * @param {Date | string} value - The value to validate, can be a Date object or a string
   * @param {DateValidatorOptions} [options={}] - Optional configuration options for the validator
   *
   * @return {string | undefined} Error message if validation fails, undefined if validation passes
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
