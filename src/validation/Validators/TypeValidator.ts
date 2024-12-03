import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { Validation } from "../Validation";
import { ValidatorDefinition } from "./types";
import { ModelKeys } from "../../utils/constants";
import { Reflection } from "@decaf-ts/reflection";

/**
 * @summary Required Validator
 *
 * @class RequiredValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.TYPE)
export class TypeValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.TYPE) {
    super(message);
  }

  /**
   * @summary Validates a model
   * @param {string} value
   * @param {string | string[] | {name: string}} types
   * @param {string} [message]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: any,
    types: string | string[] | { name: string },
    message?: string
  ): string | undefined {
    if (value === undefined) return; // Dont try and enforce type if undefined
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

Validation.register({
  validator: TypeValidator,
  validationKey: ModelKeys.TYPE,
  save: false,
} as ValidatorDefinition);
