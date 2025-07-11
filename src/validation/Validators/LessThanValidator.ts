import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { LessThanValidatorOptions } from "../types";
import { isLessThan } from "./utils";
import type { PathProxy } from "../../utils/PathProxy";

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
   * @param {LessThanValidatorOptions} options
   * @param {PathProxy<any>} accessor - Proxy-like object used to resolve values from nested structures via path strings.
   *
   * @return {string | undefined}
   *
   * @override
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: any,
    options: LessThanValidatorOptions,
    accessor: PathProxy<any>
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = accessor.getValueFromPath(
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
