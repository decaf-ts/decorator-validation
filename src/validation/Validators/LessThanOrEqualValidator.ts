import { DEFAULT_ERROR_MESSAGES } from "./constants";
import type { InternalComparisonValidatorOptions } from "../types";
import type { PathProxy } from "../../utils/PathProxy";
import { ComparisonValidator } from "./ComparisonValidator";

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
export class LessThanOrEqualValidator extends ComparisonValidator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.LESS_THAN_OR_EQUAL) {
    super(message);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {InternalComparisonValidatorOptions} options
   * @param {PathProxy<any>} accessor - Proxy-like object used to resolve values from nested structures via path strings.
   *
   * @return {string | undefined}
   *
   * @override
   * @see Validator#hasErrors
   */
  public override hasErrors(
    value: any,
    options: InternalComparisonValidatorOptions,
    accessor: PathProxy<any>
  ): string | undefined {
    return super.hasErrors(value, options, accessor);
  }
}
