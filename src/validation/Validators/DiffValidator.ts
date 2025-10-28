import { DEFAULT_ERROR_MESSAGES } from "./constants";
import type { InternalComparisonValidatorOptions } from "../types";
import type { PathProxy } from "../../utils";
import { ComparisonValidator } from "./ComparisonValidator";

/**
 * Delegates to ComparisonValidator
 */
export class DiffValidator extends ComparisonValidator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.DIFF) {
    super(message);
  }

  public override hasErrors(
    value: any,
    options: InternalComparisonValidatorOptions,
    accessor: PathProxy<any>
  ): string | undefined {
    return super.hasErrors(value, options, accessor);
  }
}
