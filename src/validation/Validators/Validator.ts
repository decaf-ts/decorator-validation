import { DEFAULT_ERROR_MESSAGES } from "./constants";
import { sf } from "../../utils/strings";
import { Reflection } from "@decaf-ts/reflection";
import { ValidatorOptions } from "../types";
import type { PathProxy } from "../../utils";

/**
 * @description Abstract base class for all validators in the validation framework
 * @summary The Validator class provides the foundation for all validator implementations.
 * It handles type checking, error message formatting, and defines the common interface
 * that all validators must implement. This class is designed to be extended by specific
 * validator implementations that provide concrete validation logic.
 *
 * @param {string} message - Default error message to display when validation fails, defaults to {@link DEFAULT_ERROR_MESSAGES#DEFAULT}
 * @param {string[]} acceptedTypes - Array of type names that this validator can validate
 *
 * @class Validator
 * @abstract
 *
 * @example
 * ```typescript
 * // Example of extending the Validator class to create a custom validator
 * class CustomValidator extends Validator<CustomValidatorOptions> {
 *   constructor(message: string = "Custom validation failed") {
 *     // Specify that this validator accepts String and Number types
 *     super(message, String.name, Number.name);
 *   }
 *
 *   public hasErrors(value: any, options?: CustomValidatorOptions): string | undefined {
 *     // Implement custom validation logic
 *     if (someCondition) {
 *       return this.getMessage(options?.message || this.message);
 *     }
 *     return undefined; // No errors
 *   }
 * }
 * ```
 *
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant V as Validator Subclass
 *   participant B as Base Validator
 *
 *   C->>V: new CustomValidator(message)
 *   V->>B: super(message, acceptedTypes)
 *   B->>B: Store message and types
 *   B->>B: Wrap hasErrors with type checking
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
export abstract class Validator<V extends ValidatorOptions = ValidatorOptions> {
  readonly message: string;
  readonly acceptedTypes?: string[];

  protected constructor(
    message: string = DEFAULT_ERROR_MESSAGES.DEFAULT,
    ...acceptedTypes: string[]
  ) {
    this.message = message;

    if (acceptedTypes.length) this.acceptedTypes = acceptedTypes;
    if (this.acceptedTypes)
      this.hasErrors = this.checkTypeAndHasErrors(this.hasErrors.bind(this));
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
    unbound: (value: any, ...args: any[]) => string | undefined
  ) {
    return function (
      this: Validator,
      value: any,
      ...args: any[]
    ): string | undefined {
      if (value === undefined || !this.acceptedTypes)
        return unbound(value, ...args);
      if (!Reflection.checkTypes(value, this.acceptedTypes))
        return this.getMessage(
          DEFAULT_ERROR_MESSAGES.TYPE,
          this.acceptedTypes.join(", "),
          typeof value
        );
      return unbound(value, ...args);
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
  ): string | undefined;

  /**
   * @summary Duck typing for Validators
   * @param val
   */
  static isValidator(val: any): boolean {
    return val.constructor && !!val["hasErrors"];
  }
}
