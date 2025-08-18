import type { ValidatorOptions } from "../types";
import type { PathProxy } from "../../utils";
import { BaseValidator } from "./BaseValidator";
import { DEFAULT_ERROR_MESSAGES } from "./constants";

/**
 * @description
 * Abstract class for defining asynchronous validators.
 *
 * This class extends the base `Validator` and enforces that any implementation
 * of `hasErrors` must be asynchronous, always returning a Promise.
 *
 * Use this when the validation process involves asynchronous operations,
 * such as API calls, database lookups, or time-based checks (e.g., timeouts).
 *
 * @example
 * ```typescript
 * // Example of an asynchronous validator that compares value against a timeout
 * class TimeoutValidator extends AsyncValidator<{ timeout?: number }> {
 *   constructor(message: string = "Validation failed due to timeout") {
 *     super(message);
 *   }
 *
 *   async hasErrors(value: number, options?: { timeout?: number }) {
 *     const delay = options?.timeout ?? 100;
 *
 *     // async call
 *     await new Promise(res => setTimeout(res, delay));
 *
 *     if (value > delay) {
 *       // Rejects the validation after waiting the delay if value is greater
 *       return Promise.resolve(this.getMessage());
 *     }
 *
 *     // Passes the validation after waiting the delay
 *     return Promise.resolve(undefined);
 *   }
 * }
 *
 * // Example usage:
 * const validator = new TimeoutValidator();
 *
 * async function runValidation() {
 *  const error = await validator.hasErrors(50, { timeout: 100 });
 *  if (error) {
 *    return console.error('Validation error:', error);
 *  }
 *  console.log('Value is valid');
 * }
 *
 * await runValidation();
 * ```
 *
 * - If `value > timeout`, the validator waits for the delay and then rejects with an error.
 * - If `value <= timeout`, the validator waits for the delay and resolves successfully with `undefined`.
 *
 * @see {@link Validator} For the base synchronous validator.
 */
export abstract class AsyncValidator<
  V extends ValidatorOptions,
> extends BaseValidator<V, true> {
  protected constructor(
    message: string = DEFAULT_ERROR_MESSAGES.DEFAULT,
    ...acceptedTypes: string[]
  ) {
    super(true, message, ...acceptedTypes);
  }

  /**
   * @description
   * Asynchronously validates a value.
   *
   * @template V - Type of the option object that can be passed to the validator
   * @param {any} value - The value to validate
   * @param {V} [options] - Optional configuration options for customizing validation behavior
   * @param {PathProxy<any>} proxy -
   * @return Promise<string | undefined> Error message if validation fails, undefined if validation passes
   *
   * @see {@link Validator}
   */
  public abstract override hasErrors(
    value: any,
    options?: V,
    proxy?: PathProxy<any>
  ): Promise<string | undefined>;
}
