import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { GreaterThanOrEqualValidatorOptions } from "../types";
import {
  getValueByPath,
  isGreaterThan,
  isValidForGteOrLteComparison,
} from "./utils";
import { isEqual } from "@decaf-ts/reflection";

/**
 * @summary Greater Than or Equal Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#GREATER_THAN_OR_EQUAL}
 *
 * @class GreaterThanOrEqualValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.GREATER_THAN_OR_EQUAL)
export class GreaterThanOrEqualValidator extends Validator<GreaterThanOrEqualValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.GREATER_THAN_OR_EQUAL) {
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
    options: GreaterThanOrEqualValidatorOptions,
    instance: any
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = getValueByPath(
        instance,
        options[ValidationKeys.GREATER_THAN_OR_EQUAL]
      );
    } catch (e: any) {
      return this.getMessage(e.message || this.message);
    }

    try {
      if (
        (isValidForGteOrLteComparison(value, comparisonPropertyValue) &&
          isEqual(value, comparisonPropertyValue)) ||
        isGreaterThan(value, comparisonPropertyValue)
      )
        return undefined;

      throw new Error(options.message || this.message);
    } catch (e: any) {
      return this.getMessage(
        e.message,
        options[ValidationKeys.GREATER_THAN_OR_EQUAL]
      );
    }
  }
}
