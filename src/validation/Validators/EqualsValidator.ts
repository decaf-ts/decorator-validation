import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { EqualsValidatorOptions } from "../types";
import { isEqual } from "@decaf-ts/reflection";
import type { PathProxy } from "../../utils";

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
   * @param {EqualsValidatorOptions} options
   * @param {PathProxy<any>} accessor - Proxy-like object used to resolve values from nested structures via path strings.
   *
   * @return {string | undefined}
   *
   * @override
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: any,
    options: EqualsValidatorOptions,
    accessor: PathProxy<any>
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = accessor.getValueFromPath(
        options[ValidationKeys.EQUALS]
      );
    } catch (e: any) {
      return this.getMessage(e.message || this.message);
    }

    return isEqual(value, comparisonPropertyValue)
      ? undefined
      : this.getMessage(
          options.message || this.message,
          options.label || options[ValidationKeys.EQUALS]
        );
  }
}

// Validation.register({
//   validator: EqualsValidator,
//   validationKey: ValidationKeys.EQUALS,
//   save: false,
// } as ValidatorDefinition);
