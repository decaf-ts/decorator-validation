import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { EqualsValidatorOptions } from "../types";
import { isEqual } from "@decaf-ts/reflection";
import { getValueByPath } from "./utils";

/**
 * @summary Equals Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#EQUALS}
 *
 * @class EqualsValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.EQUALS)
export class EqualsValidator extends Validator<EqualsValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.EQUALS) {
    super(message);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {ComparisonValidatorOptions} options
   *
   * @return {string | undefined}
   *
   * @override
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: any,
    options: EqualsValidatorOptions,
    instance: any
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = getValueByPath(
        instance,
        options[ValidationKeys.EQUALS]
      );
    } catch (e: any) {
      return this.getMessage(e.message || this.message);
    }

    return isEqual(value, comparisonPropertyValue)
      ? undefined
      : this.getMessage(
          options.message || this.message,
          options[ValidationKeys.EQUALS]
        );
  }
}

// Validation.register({
//   validator: EqualsValidator,
//   validationKey: ValidationKeys.EQUALS,
//   save: false,
// } as ValidatorDefinition);
