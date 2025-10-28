import { DEFAULT_ERROR_MESSAGES } from "./constants";
import type { InternalComparisonValidatorOptions } from "../types";
import type { PathProxy } from "../../utils/PathProxy";
import { ComparisonValidator } from "./ComparisonValidator";

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
export class GreaterThanValidator extends ComparisonValidator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.GREATER_THAN) {
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
