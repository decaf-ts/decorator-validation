import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { GreaterThanOrEqualValidatorOptions } from "../types";
import { isGreaterThan, isValidForGteOrLteComparison } from "./utils";
import { isEqual } from "../../utils/equality";
import type { PathProxy } from "../../utils/PathProxy";

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
    super(message, Number.name, Date.name);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {GreaterThanOrEqualValidatorOptions} options
   * @param {PathProxy<any>} accessor - Proxy-like object used to resolve values from nested structures via path strings.
   *
   * @return {string | undefined}
   *
   * @override
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: any,
    options: GreaterThanOrEqualValidatorOptions,
    accessor: PathProxy<any>
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = accessor.getValueFromPath(
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
        options.label || options[ValidationKeys.GREATER_THAN_OR_EQUAL]
      );
    }
  }
}
