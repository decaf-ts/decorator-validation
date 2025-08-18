import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { Validation } from "../Validation";
import {
  TypeValidatorOptions,
  ValidatorDefinition,
  ValidatorOptions,
} from "../types";
import { ModelKeys } from "../../utils/constants";
import { Reflection } from "@decaf-ts/reflection";

/**
 * @description Validator for checking if a value is of the expected type(s)
 * @summary The TypeValidator ensures that a value matches one of the specified types.
 * It can validate against a single type, multiple types, or a type with a specific name.
 * This validator is typically used with the @type decorator and is fundamental for
 * ensuring type safety in validated models.
 *
 * @param {string} [message] - Custom error message to display when validation fails, defaults to {@link DEFAULT_ERROR_MESSAGES#TYPE}
 *
 * @class TypeValidator
 * @extends Validator
 *
 * @example
 * ```typescript
 * // Create a type validator with default error message
 * const typeValidator = new TypeValidator();
 *
 * // Create a type validator with custom error message
 * const customTypeValidator = new TypeValidator("Value must be of type {0}, but got {1}");
 *
 * // Validate against a single type
 * const stringOptions = { types: "string" };
 * typeValidator.hasErrors("hello", stringOptions); // undefined (valid)
 * typeValidator.hasErrors(123, stringOptions); // Returns error message (invalid)
 *
 * // Validate against multiple types
 * const multiOptions = { types: ["string", "number"] };
 * typeValidator.hasErrors("hello", multiOptions); // undefined (valid)
 * typeValidator.hasErrors(123, multiOptions); // undefined (valid)
 * typeValidator.hasErrors(true, multiOptions); // Returns error message (invalid)
 *
 * // Validate against a class type
 * const classOptions = { types: { name: "Date" } };
 * typeValidator.hasErrors(new Date(), classOptions); // undefined (valid)
 * ```
 *
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant V as TypeValidator
 *   participant R as Reflection
 *
 *   C->>V: new TypeValidator(message)
 *   C->>V: hasErrors(value, options)
 *   alt value is undefined
 *     V-->>C: undefined (valid)
 *   else value is defined
 *     V->>R: evaluateDesignTypes(value, types)
 *     alt type evaluation passes
 *       V-->>C: undefined (valid)
 *     else type evaluation fails
 *       V->>V: Format error message with type info
 *       V-->>C: Error message
 *     end
 *   end
 *
 * @category Validators
 */
@validator(ValidationKeys.TYPE)
export class TypeValidator extends Validator<TypeValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.TYPE) {
    super(message);
  }

  /**
   * @description Checks if a value is of the expected type(s)
   * @summary Validates that the provided value matches one of the specified types.
   * It uses the Reflection utility to evaluate if the value's type matches the expected types.
   * The method skips validation for undefined values to avoid conflicts with the RequiredValidator.
   *
   * @param {any} value - The value to validate
   * @param {TypeValidatorOptions} options - Configuration options containing the expected types
   *
   * @return {string | undefined} Error message if validation fails, undefined if validation passes
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: any,
    options: TypeValidatorOptions
  ): string | undefined {
    if (value === undefined) return; // Don't try and enforce type if undefined
    const { types, message } = options;
    if (!Reflection.evaluateDesignTypes(value, types))
      return this.getMessage(
        message || this.message,
        typeof types === "string"
          ? types
          : Array.isArray(types)
            ? types.join(", ")
            : types.name,
        typeof value
      );
  }
}

/**
 * @description Register the TypeValidator with the Validation registry
 * @summary This registration associates the TypeValidator with the ModelKeys.TYPE key,
 * allowing it to be used for validating design types. The save flag is set to false
 * to prevent the validator from being saved in the standard validator registry.
 *
 * @memberOf module:decorator-validation
 */
Validation.register({
  validator: TypeValidator as ValidatorOptions,
  validationKey: ModelKeys.TYPE,
  save: false,
} as ValidatorDefinition);
