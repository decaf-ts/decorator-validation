import { DEFAULT_ERROR_MESSAGES } from "./constants";
import type { InternalComparisonValidatorOptions } from "../types";
import type { PathProxy } from "../../utils";
import { ComparisonValidator } from "./ComparisonValidator";

/**
 * Backwards-compatible EqualsValidator wrapper that delegates to ComparisonValidator
 */
export class EqualsValidator extends ComparisonValidator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.EQUALS) {
    super(message);
  }

  // keep signature compatible
  public override hasErrors(
    value: any,
    options: InternalComparisonValidatorOptions,
    accessor: PathProxy<any>
  ): string | undefined {
    return super.hasErrors(value, options, accessor);
  }
}

// Validation.register({
//   validator: EqualsValidator,
//   validationKey: ValidationKeys.EQUALS,
//   save: false,
// } as ValidatorDefinition);
