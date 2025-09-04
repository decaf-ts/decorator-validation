import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { DiffValidatorOptions } from "../types";
import { isEqual } from "@decaf-ts/reflection";
import type { PathProxy } from "../../utils";

/**
 * @summary Diff Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#DiffValidator}
 *
 * @class DiffValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.DIFF)
export class DiffValidator extends Validator<DiffValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.DIFF) {
    super(message);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {DiffValidatorOptions} options
   * @param {PathProxy<any>} accessor - Proxy-like object used to resolve values from nested structures via path strings.
   *
   * @return {string | undefined}
   *
   * @override
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: any,
    options: DiffValidatorOptions,
    accessor: PathProxy<any>
  ): string | undefined {
    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = accessor.getValueFromPath(
        options[ValidationKeys.DIFF]
      );
    } catch (e: any) {
      return this.getMessage(e.message || this.message);
    }

    return isEqual(value, comparisonPropertyValue)
      ? this.getMessage(
          options.message || this.message,
          options.label || options[ValidationKeys.DIFF]
        )
      : undefined;
  }
}
