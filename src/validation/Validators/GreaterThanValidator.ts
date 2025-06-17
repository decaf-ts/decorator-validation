import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { GreaterThanValidatorOptions } from "../types";
import { isGreaterThan } from "./utils";
import type { PathProxy } from "../../utils/PathProxy";

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
   * @param {GreaterThanValidatorOptions} options
   * @param {PathProxy<any>} accessor - Proxy-like object used to resolve values from nested structures via path strings.
   *
   * @return {string | undefined}
   *
   * @override
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: any,
    options: GreaterThanValidatorOptions,
    accessor: PathProxy<any>
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = accessor.getValueFromPath(
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
