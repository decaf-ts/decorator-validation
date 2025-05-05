import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { ValidatorOptions } from "../types";

/**
 * @description Validator for checking if a value is present and not empty
 * @summary The RequiredValidator ensures that a value is provided and not empty.
 * It handles different types of values appropriately: for booleans and numbers,
 * it checks if they're undefined; for other types (strings, arrays, objects),
 * it checks if they're falsy. This validator is typically used with the @required decorator
 * and is often the first validation applied to important fields.
 * 
 * @param {string} [message] - Custom error message to display when validation fails, defaults to {@link DEFAULT_ERROR_MESSAGES#REQUIRED}
 * 
 * @class RequiredValidator
 * @extends Validator
 * 
 * @example
 * ```typescript
 * // Create a required validator with default error message
 * const requiredValidator = new RequiredValidator();
 * 
 * // Create a required validator with custom error message
 * const customRequiredValidator = new RequiredValidator("This field is mandatory");
 * 
 * // Validate different types of values
 * requiredValidator.hasErrors("Hello"); // undefined (valid)
 * requiredValidator.hasErrors(""); // Returns error message (invalid)
 * requiredValidator.hasErrors(0); // undefined (valid - 0 is a valid number)
 * requiredValidator.hasErrors(null); // Returns error message (invalid)
 * requiredValidator.hasErrors([]); // undefined (valid - empty array is still an array)
 * ```
 * 
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant V as RequiredValidator
 *   
 *   C->>V: new RequiredValidator(message)
 *   C->>V: hasErrors(value, options)
 *   alt typeof value is boolean or number
 *     alt value is undefined
 *       V-->>C: Error message
 *     else value is defined
 *       V-->>C: undefined (valid)
 *     end
 *   else other types
 *     alt value is falsy (null, undefined, empty string)
 *       V-->>C: Error message
 *     else value is truthy
 *       V-->>C: undefined (valid)
 *     end
 *   end
 * 
 * @category Validators
 */
@validator(ValidationKeys.REQUIRED)
export class RequiredValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.REQUIRED) {
    super(message);
  }

  /**
   * @description Checks if a value is present and not empty
   * @summary Validates that the provided value exists and is not empty.
   * The validation logic varies by type:
   * - For booleans and numbers: checks if the value is undefined
   * - For other types (strings, arrays, objects): checks if the value is falsy
   *
   * @param {any} value - The value to validate
   * @param {ValidatorOptions} [options={}] - Optional configuration options
   *
   * @return {string | undefined} Error message if validation fails, undefined if validation passes
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: any,
    options: ValidatorOptions = {}
  ): string | undefined {
    switch (typeof value) {
      case "boolean":
      case "number":
        return typeof value === "undefined"
          ? this.getMessage(options.message || this.message)
          : undefined;
      default:
        return !value
          ? this.getMessage(options.message || this.message)
          : undefined;
    }
  }
}
