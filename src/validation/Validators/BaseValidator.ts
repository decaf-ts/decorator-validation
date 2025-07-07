import { DEFAULT_ERROR_MESSAGES } from "./constants";
import { sf } from "../../utils/strings";
import { Reflection } from "@decaf-ts/reflection";
import { ValidatorOptions } from "../types";
import type { PathProxy } from "../../utils";
import type { ConditionalAsync } from "./types";

/**
 * @description Abstract base class for all validators in the validation framework.
 * @summary The BaseValidator class provides the foundation for all synchronous and asynchronous validator implementations.
 * It handles type checking, error message formatting, and defines the interface that all validators must implement.
 * This class is designed to be extended by specific validator classes that define their own validation logic.
 *
 * @template V - Validator options type
 * @template IsAsync - Whether the validator is async (true) or sync (false). Default `false`.
 *
 * @param {boolean} async - Defines if the validator is async (must match the subclass signature)
 * @param {string} message - Default error message to display when validation fails (defaults to {@link DEFAULT_ERROR_MESSAGES#DEFAULT})
 * @param {string[]} acceptedTypes - Type names that this validator accepts (used for runtime type checking)
 *
 * @class BaseValidator
 * @abstract
 *
 * @example
 * // Example of a synchronous validator
 * class SyncValidator extends BaseValidator<SomeOptions, false> {
 *   constructor() {
 *     super(false, "Sync validation failed", String.name);
 *   }
 *
 *   public hasErrors(value: any, options?: SomeOptions): string | undefined {
 *     if (typeof value !== "string") return this.getMessage(this.message);
 *     return undefined;
 *   }
 * }
 *
 * @example
 * // Example of an asynchronous custom validator
 * class AsyncValidator extends BaseValidator<SomeOptions, true> {
 *   constructor() {
 *     super(true, "Async validation failed", String.name);
 *   }
 *
 *   public async hasErrors(value: any, options?: SomeOptions): Promise<string | undefined> {
 *     const result = await someAsyncCheck(value);
 *     if (!result) return this.getMessage(this.message);
 *     return undefined;
 *   }
 * }
 *
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant V as Validator Subclass
 *   participant B as BaseValidator
 *
 *   C->>V: new CustomValidator(async, message)
 *   V->>B: super(async, message, acceptedTypes)
 *   B->>B: Store message, async flag, and accepted types
 *   B->>B: Optionally wrap hasErrors with type checking
 *   C->>V: hasErrors(value, options)
 *   alt value type not in acceptedTypes
 *     B-->>C: Type error message
 *   else value type is accepted
 *     V->>V: Custom validation logic
 *     V-->>C: Validation result
 *   end
 *
 * @category Validators
 */
export abstract class BaseValidator<
  V extends ValidatorOptions = ValidatorOptions,
  Async extends boolean = false,
> {
  readonly message: string;
  readonly acceptedTypes?: string[];
  readonly async?: Async;

  protected constructor(
    async: Async,
    message: string = DEFAULT_ERROR_MESSAGES.DEFAULT,
    ...acceptedTypes: string[]
  ) {
    this.async = async;
    this.message = message;

    if (acceptedTypes.length) this.acceptedTypes = acceptedTypes;
    if (this.acceptedTypes)
      this.hasErrors = this.checkTypeAndHasErrors(
        this.hasErrors.bind(this)
      ) as any;
  }

  /**
   * @description Formats an error message with optional arguments
   * @summary Creates a formatted error message by replacing placeholders with provided arguments.
   * This method uses the string formatting utility to generate consistent error messages
   * across all validators.
   *
   * @param {string} message - The message template with placeholders
   * @param {...any} args - Values to insert into the message template
   * @return {string} The formatted error message
   * @protected
   */
  protected getMessage(message: string, ...args: any[]) {
    return sf(message, ...args);
  }

  /**
   * @description Creates a type-checking wrapper around the hasErrors method
   * @summary Wraps the hasErrors method with type validation logic to ensure that
   * the value being validated is of an accepted type before performing specific validation.
   * This method is called during construction if acceptedTypes are provided.
   *
   * @param {Function} unbound - The original hasErrors method to be wrapped
   * @return {Function} A new function that performs type checking before calling the original method
   * @private
   */
  private checkTypeAndHasErrors(
    unbound: (
      value: any,
      options?: V,
      proxy?: PathProxy<any>,
      ...args: any[]
    ) => ConditionalAsync<Async, string | undefined>
  ) {
    return function (
      this: BaseValidator,
      value: any,
      options: V,
      proxy?: PathProxy<any>,
      ...args: any[]
    ) {
      if (value === undefined || !this.acceptedTypes)
        return unbound(value, options, proxy, ...args);
      if (!Reflection.checkTypes(value, this.acceptedTypes))
        return this.getMessage(
          DEFAULT_ERROR_MESSAGES.TYPE,
          this.acceptedTypes.join(", "),
          typeof value
        );
      return unbound(value, options, proxy, ...args);
    }.bind(this);
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
  public abstract hasErrors(
    value: any,
    options?: V,
    proxy?: PathProxy<any>
  ): ConditionalAsync<Async, string | undefined>;

  /**
   * @summary Duck typing for Validators
   * @param val
   */
  static isValidator(val: any): boolean {
    return val.constructor && !!val["hasErrors"];
  }
}
