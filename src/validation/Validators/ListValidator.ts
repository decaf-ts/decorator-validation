import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { ListValidatorOptions } from "../types";
import { Constructor } from "../../model";

/**
 * @description Validator for checking if elements in a list or set match expected types
 * @summary The ListValidator validates that all elements in an array or Set match the expected types.
 * It checks each element against a list of allowed class types and ensures type consistency.
 * This validator is typically used with the @list decorator.
 *
 * @param {string} [message] - Custom error message to display when validation fails, defaults to {@link DEFAULT_ERROR_MESSAGES#LIST}
 *
 * @class ListValidator
 * @extends Validator
 *
 * @example
 * ```typescript
 * // Create a list validator with default error message
 * const listValidator = new ListValidator();
 *
 * // Create a list validator with custom error message
 * const customListValidator = new ListValidator("All items must be of the specified type");
 *
 * // Validate a list
 * const options = { clazz: ["String", "Number"] };
 * const result = listValidator.hasErrors(["test", 123], options); // undefined (valid)
 * const invalidResult = listValidator.hasErrors([new Date()], options); // Returns error message (invalid)
 * ```
 *
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant V as ListValidator
 *
 *   C->>V: new ListValidator(message)
 *   C->>V: hasErrors(value, options)
 *   alt value is empty
 *     V-->>C: undefined (valid)
 *   else value has elements
 *     V->>V: Check each element's type
 *     alt All elements match allowed types
 *       V-->>C: undefined (valid)
 *     else Some elements don't match
 *       V-->>C: Error message
 *     end
 *   end
 *
 * @category Validators
 */
@validator(ValidationKeys.LIST)
export class ListValidator extends Validator<ListValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.LIST) {
    super(message, Array.name, Set.name);
  }

  /**
   * @description Checks if all elements in a list or set match the expected types
   * @summary Validates that each element in the provided array or Set matches one of the
   * class types specified in the options. For object types, it checks the constructor name,
   * and for primitive types, it compares against the lowercase type name.
   *
   * @param {any[] | Set<any>} value - The array or Set to validate
   * @param {ListValidatorOptions} options - Configuration options containing the allowed class types
   *
   * @return {string | undefined} Error message if validation fails, undefined if validation passes
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  hasErrors(
    value: any[] | Set<any>,
    options: ListValidatorOptions
  ): string | undefined {
    if (!value || (Array.isArray(value) ? !value.length : !value.size)) return;

    const clazz = (
      Array.isArray(options.clazz) ? options.clazz : [options.clazz]
    ).map((c) => {
      if (typeof c === "string") return c;
      if (!c.name) return (c as () => Constructor<any>)().name;
      return c.name;
    });
    let val: any,
      isValid = true;
    for (
      let i = 0;
      i < (Array.isArray(value) ? value.length : value.size);
      i++
    ) {
      val = (value as any)[i];
      switch (typeof val) {
        case "object":
        case "function":
          isValid = clazz.includes(((val ?? {}) as object).constructor?.name); // null is an object
          break;
        default:
          isValid = clazz.some((c: string) => typeof val === c.toLowerCase());
          break;
      }
    }

    return isValid
      ? undefined
      : this.getMessage(options.message || this.message, clazz);
  }
}
