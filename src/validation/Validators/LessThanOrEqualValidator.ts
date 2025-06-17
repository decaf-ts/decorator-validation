import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import type { LessThanOrEqualValidatorOptions } from "../types";
import { isLessThan, isValidForGteOrLteComparison } from "./utils";
import { isEqual } from "@decaf-ts/reflection";
import type { PathProxy } from "../../utils/PathProxy";

/**
 * @summary Less Than or Equal Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#LESS_THAN_OR_EQUAL}
 *
 * @class LessThanOrEqualValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.LESS_THAN_OR_EQUAL)
export class LessThanOrEqualValidator extends Validator<LessThanOrEqualValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.LESS_THAN_OR_EQUAL) {
    super(message);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {LessThanOrEqualValidatorOptions} options
   * @param {PathProxy<any>} accessor - Proxy-like object used to resolve values from nested structures via path strings.
   *
   * @return {string | undefined}
   *
   * @override
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: any,
    options: LessThanOrEqualValidatorOptions,
    accessor: PathProxy
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = accessor.getValueFromPath(
        options[ValidationKeys.LESS_THAN_OR_EQUAL]
      );
    } catch (e: any) {
      return this.getMessage(e.message || this.message);
    }

    try {
      if (
        (isValidForGteOrLteComparison(value, comparisonPropertyValue) &&
          isEqual(value, comparisonPropertyValue)) ||
        isLessThan(value, comparisonPropertyValue)
      )
        return undefined;

      throw new Error(options.message || this.message);
    } catch (e: any) {
      return this.getMessage(
        e.message,
        options[ValidationKeys.LESS_THAN_OR_EQUAL]
      );
    }
  }
}
