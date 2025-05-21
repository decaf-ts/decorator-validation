import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { GreaterThanValidatorOptions } from "../types";
import { getValueByPath, isGreaterThan } from "./utils";

/**
 * @summary Greater Than Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#GREATER_THAN}
 *
 * @class GreaterThanValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.GREATER_THAN)
export class GreaterThanValidator extends Validator<GreaterThanValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.GREATER_THAN) {
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
    options: GreaterThanValidatorOptions,
    instance: any
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = getValueByPath(
        instance,
        options[ValidationKeys.GREATER_THAN]
      );
    } catch (e: any) {
      return this.getMessage(e.message || this.message);
    }

    try {
      if (!isGreaterThan(value, comparisonPropertyValue))
        throw new Error(options.message || this.message);
    } catch (e: any) {
      return this.getMessage(e.message, options[ValidationKeys.GREATER_THAN]);
    }

    return undefined;
  }
}
