import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import type { PathProxy } from "../../utils/PathProxy";
import { isEqual } from "@decaf-ts/reflection";
import {
  isLessThan,
  isGreaterThan,
  isValidForGteOrLteComparison,
} from "./utils";
import type { InternalComparisonValidatorOptions } from "../types";
import { Validation } from "../Validation";

/**
 * ComparisonValidator: single validator that handles comparisons using a handler
 */
@validator(
  ValidationKeys.EQUALS,
  ValidationKeys.DIFF,
  ValidationKeys.LESS_THAN,
  ValidationKeys.LESS_THAN_OR_EQUAL,
  ValidationKeys.GREATER_THAN,
  ValidationKeys.GREATER_THAN_OR_EQUAL
)
export class ComparisonValidator extends Validator<InternalComparisonValidatorOptions> {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.DEFAULT) {
    super(message);
  }

  public hasErrors(
    value: any,
    options: InternalComparisonValidatorOptions,
    accessor: PathProxy<any>
  ): string | undefined {
    const comparisonKey = options.comparisonKey as string | undefined;
    if (!comparisonKey) {
      return this.getMessage(options.message || this.message);
    }

    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = accessor.getValueFromPath(
        (options as any)[comparisonKey]
      );
    } catch (e: any) {
      return this.getMessage(e.message || this.message);
    }

    // handler is required
    if (typeof (options as any).handler !== "function") {
      return this.getMessage(options.message || this.message);
    }

    try {
      const ok = (options as any).handler(value, comparisonPropertyValue);
      if (ok) return undefined;
      return this.getMessage(
        options.message || this.message,
        options.label || (options as any)[comparisonKey]
      );
    } catch (e: any) {
      return this.getMessage(
        e.message || this.message,
        options.label || (options as any)[comparisonKey]
      );
    }
  }
}
