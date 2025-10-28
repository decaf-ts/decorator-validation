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
    const key = Object.keys(options).find((k) =>
      [
        ValidationKeys.EQUALS,
        ValidationKeys.DIFF,
        ValidationKeys.LESS_THAN,
        ValidationKeys.LESS_THAN_OR_EQUAL,
        ValidationKeys.GREATER_THAN,
        ValidationKeys.GREATER_THAN_OR_EQUAL,
      ].includes(k as any)
    ) as string | undefined;

    if (!key) return undefined;

    let comparisonPropertyValue: any;
    try {
      comparisonPropertyValue = accessor.getValueFromPath(
        (options as any)[key]
      );
    } catch (e: any) {
      return this.getMessage(e.message || this.message);
    }

    // if a handler is supplied, use it
    if (typeof (options as any).handler === "function") {
      try {
        const ok = (options as any).handler(value, comparisonPropertyValue);
        if (ok) return undefined;
        return this.getMessage(
          options.message || this.message,
          options.label || (options as any)[key]
        );
      } catch (e: any) {
        return this.getMessage(e.message || this.message);
      }
    }

    // fallback logic for known comparison keys
    try {
      switch (key) {
        case ValidationKeys.EQUALS:
          return isEqual(value, comparisonPropertyValue)
            ? undefined
            : this.getMessage(
                options.message || this.message,
                options.label || (options as any)[key]
              );
        case ValidationKeys.DIFF:
          return isEqual(value, comparisonPropertyValue)
            ? this.getMessage(
                options.message || this.message,
                options.label || (options as any)[key]
              )
            : undefined;
        case ValidationKeys.LESS_THAN:
          if (!isLessThan(value, comparisonPropertyValue))
            throw new Error(options.message || this.message);
          return undefined;
        case ValidationKeys.LESS_THAN_OR_EQUAL:
          if (
            (isValidForGteOrLteComparison(value, comparisonPropertyValue) &&
              isEqual(value, comparisonPropertyValue)) ||
            isLessThan(value, comparisonPropertyValue)
          )
            return undefined;
          throw new Error(options.message || this.message);
        case ValidationKeys.GREATER_THAN:
          if (!isGreaterThan(value, comparisonPropertyValue))
            throw new Error(options.message || this.message);
          return undefined;
        case ValidationKeys.GREATER_THAN_OR_EQUAL:
          if (
            (isValidForGteOrLteComparison(value, comparisonPropertyValue) &&
              isEqual(value, comparisonPropertyValue)) ||
            isGreaterThan(value, comparisonPropertyValue)
          )
            return undefined;
          throw new Error(options.message || this.message);
        default:
          return undefined;
      }
    } catch (e: any) {
      return this.getMessage(e.message, options.label || options[key]);
    }
  }
}
