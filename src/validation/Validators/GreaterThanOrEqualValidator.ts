import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import type { ComparisonValidatorOptions } from "../types";
import { getValueByPath, isGreaterThan } from "./utils";
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
export class GreaterThanOrEqualValidator extends Validator<ComparisonValidatorOptions> {
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
    options: ComparisonValidatorOptions,
    instance: any
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = getValueByPath(
        instance,
        options.propertyToCompare
      );
    } catch (e: any) {
      return this.getMessage(e.message || this.message);
    }

    return isGreaterThan(value, comparisonPropertyValue) ||
      isEqual(value, comparisonPropertyValue)
      ? undefined
      : this.getMessage(
          options.message || this.message,
          options.propertyToCompare
        );
  }
}
