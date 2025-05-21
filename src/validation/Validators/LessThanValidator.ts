import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { LessThanValidatorOptions } from "../types";
import { getValueByPath, isLessThan } from "./utils";

/**
 * @summary Less Than Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#LESS_THAN}
 *
 * @class LessThanValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.LESS_THAN)
export class LessThanValidator extends Validator<LessThanValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.LESS_THAN) {
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
    options: LessThanValidatorOptions,
    instance: any
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = getValueByPath(
        instance,
        options[ValidationKeys.LESS_THAN]
      );
    } catch (e: any) {
      return this.getMessage(e.message || this.message);
    }

    try {
      if (!isLessThan(value, comparisonPropertyValue))
        throw new Error(options.message || this.message);
    } catch (e: any) {
      return this.getMessage(e.message, options[ValidationKeys.LESS_THAN]);
    }

    return undefined;
  }
}
