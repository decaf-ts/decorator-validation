import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { DiffValidatorOptions } from "../types";
import { isEqual } from "@decaf-ts/reflection";
import { getValueByPath } from "./utils";

/**
 * @summary Diff Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#DiffValidator}
 *
 * @class DiffValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.DIFF)
export class DiffValidator extends Validator<DiffValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.DIFF) {
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
    options: DiffValidatorOptions,
    instance: any
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = getValueByPath(
        instance,
        options[ValidationKeys.DIFF]
      );
    } catch (e: any) {
      return this.getMessage(e.message || this.message);
    }

    return isEqual(value, comparisonPropertyValue)
      ? this.getMessage(
          options.message || this.message,
          options[ValidationKeys.DIFF]
        )
      : undefined;
  }
}
