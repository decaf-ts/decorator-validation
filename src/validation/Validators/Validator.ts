import { DEFAULT_ERROR_MESSAGES } from "./constants";
import { ValidatorOptions } from "../types";
import type { PathProxy } from "../../utils";
import { BaseValidator } from "./BaseValidator";

/**
 * @description
 * Abstract class for defining synchronous validators.
 *
 * This class extends the base {@link BaseValidator} and enforces that any implementation of `hasErrors` must be synchronous.
 *
 * Use this when the validation process is immediate and does not require asynchronous operations.
 *
 * @example
 * ```typescript
 * // Example of a synchronous validator that checks if a number is greater than
 * class GreaterThanValidator extends Validator<{ gt?: number }> {
 *   constructor(message: string = "Value must be greater than {0}") {
 *     super(message);
 *   }
 *
 *   hasErrors(value: number, options?: { gt?: number }) {
 *     const minValue = options?.gt ?? 0;
 *     if (value <= minValue) {
 *       return this.getMessage();
 *     }
 *     return undefined;
 *   }
 * }
 *
 * // Example usage:
 * const validator = new GreaterThanValidator();
 * const error = validator.hasErrors(10, { gt: 15 });
 * if (error) {
 *   console.log('Value must be greater than 15')
 * } else {
 *   console.log('Value is valid');
 * }
 * ```
 *
 * - If `value` is less than or equal to `gt`, returns the error message.
 * - Otherwise, returns `undefined` indicating validation success.
 *
 * @see {@link BaseValidator} For the base validator.
 * @see {@link ValidatorOptions} For the base validator options.
 */
export abstract class Validator<
  V extends ValidatorOptions,
> extends BaseValidator<V, false> {
  protected constructor(
    message: string = DEFAULT_ERROR_MESSAGES.DEFAULT,
    ...acceptedTypes: string[]
  ) {
    super(false, message, ...acceptedTypes);
  }

  /**
   * @description Validates a value against specific validation rules
   * @summary Abstract method that must be implemented by all validator subclasses.
   * This method contains the core validation logic that determines whether a value
   * is valid according to the specific rules of the validator. If the value is valid,
   * the method returns undefined; otherwise, it returns an error message.
   *
   * @template V - Type of the options object that can be passed to the validator
   * @param {any} value - The value to validate
   * @param {V} [options] - Optional configuration options for customizing validation behavior
   * @param {PathProxy<any>} proxy -
   * @return {string | undefined} Error message if validation fails, undefined if validation passes
   *
   * @abstract
   *
   * @see Model#validate
   */
  abstract override hasErrors(
    value: any,
    options?: V,
    proxy?: PathProxy<any>
  ): string | undefined;
}
