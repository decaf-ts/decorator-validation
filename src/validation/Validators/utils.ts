import { VALIDATION_PARENT_KEY } from "../../constants";

/**
 * Safely retrieves a nested property value from an object using a dot-notated path string.
 *
 * @template T - The expected return type of the property value.
 *
 * @param {Record<string, any>} obj - The source object to retrieve the value from.
 * @param {string} path - A dot-separated string representing the path to the desired property (e.g., "user.address.street").
 *
 * @returns {T} - The value found at the specified path
 *
 * @throws {Error} - Throws an error if the path is not a non-empty string or if any part of the path does not exist in the object.
 */
export function getValueByPath<T>(obj: Record<string, any>, path: string): T {
  if (typeof path !== "string" || !path.trim()) {
    throw new Error(
      `Invalid path argument. Expected non-empty string but received: '${path}'`
    );
  }

  // Process parent directory access (../)
  const parentAccessors = path.match(/\.\.\//g) || [];
  const parentLevel = parentAccessors.length;
  const cleanPath = path.replace(/\.\.\//g, "");

  // Navigate up the parent chain
  let currentContext: any = obj;
  for (let i = 0; i < parentLevel; i++) {
    if (!currentContext || typeof currentContext !== "object") {
      throw new Error(
        `Unable to access parent at level ${i + 1} for path '${path}': current context is not an object`
      );
    }

    if (!currentContext[VALIDATION_PARENT_KEY]) {
      throw new Error(
        `Unable to access parent at level ${i + 1} for path '${path}': no parent available`
      );
    }

    currentContext = currentContext[VALIDATION_PARENT_KEY];
  }

  // Process dot notation path
  const parts = cleanPath.split(".");
  let currentValue: unknown = currentContext;

  for (const part of parts) {
    if (
      currentValue !== null &&
      typeof currentValue === "object" &&
      part in currentValue
    ) {
      currentValue = (currentValue as Record<string, any>)[part];
    } else {
      const parentInfo =
        parentLevel === 0
          ? ""
          : parentLevel === 1
            ? " on parent"
            : ` after ${parentLevel} parent level(s)`;

      throw new Error(
        `Failed to resolve path ${path}: property '${part}' does not exist${parentInfo}.`
      );
    }
  }

  return currentValue as T;
}

/**
 * Validates whether two values are eligible for comparison using >= or <= operators.
 *
 * Supported types: `undefined`, `number`, `bigint`, and `Date`.
 *
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 *
 * @returns {boolean} True if both values are of supported types.
 *
 * @throws {TypeError} If either value is of an unsupported type.
 */
export function isValidForGteOrLteComparison(a: any, b: any): boolean {
  const isSupported = (value: any): boolean =>
    value === undefined ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    value instanceof Date;

  if (isSupported(a) && isSupported(b)) return true;

  const aType = a === null ? "null" : a instanceof Date ? "Date" : typeof a;
  const bType = b === null ? "null" : b instanceof Date ? "Date" : typeof b;

  throw new TypeError(
    `Unsupported types for comparison: '${aType}' and '${bType}'`
  );
}

/**
 * @summary Compares two values to determine if the first is less than the second.
 * @description Supports numbers and dates. Throws an error for unsupported types.
 *
 * @param {any} a - The first value to compare.
 * @param {any} b - The second value to compare against.
 *
 * @returns {boolean} True if `a` is less than `b`, false otherwise.
 *
 * @throws {Error} If either `a` or `b` is `null` or `undefined`.
 * @throws {TypeError} If values are of mismatched or unsupported types.
 */
export function isLessThan(a: any, b: any): boolean {
  if ([null, undefined].includes(a) || [null, undefined].includes(b))
    throw new Error("Comparison failed due to null or undefined value");

  // Validate type compatibility
  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) {
    // Allow number X bigint
    if (aType === "bigint" && bType === "number") {
      return Number(a) < (b as number);
    }
    if (aType === "number" && bType === "bigint") {
      return (a as number) < Number(b);
    }
    throw new TypeError(
      `Cannot compare values of different types: '${aType}' and '${bType}'`
    );
  }

  if (typeof a === "number" && typeof b === "number") {
    if (Number.isNaN(a) || Number.isNaN(b)) {
      throw new TypeError("Comparison not supported for NaN values");
    }
    return a < b;
  }

  if (a instanceof Date && b instanceof Date) {
    if (isNaN(a.getTime()) || isNaN(b.getTime())) {
      throw new TypeError("Invalid Date objects are not comparable");
    }
    return a.getTime() < b.getTime();
  }

  throw new TypeError(`Unsupported types for lessThan comparison: '${aType}'`);
}

/**
 * Checks if `a` is greater than `b`.
 * Supports comparison for numbers and Date objects.
 *
 * @param {any} a - The value to validate.
 * @param {any} b - The value to compare against.
 *
 * @returns {boolean} True if `a` is greater than `b`, otherwise false.
 *
 * @throws {Error} If either `a` or `b` is `null` or `undefined`.
 * @throws {TypeError} If values are of mismatched or unsupported types.
 */
export function isGreaterThan(a: any, b: any): boolean {
  if ([null, undefined].includes(a) || [null, undefined].includes(b))
    throw new Error("Comparison failed due to null or undefined value");

  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) {
    // Allow number X bigint
    if (aType === "bigint" && bType === "number")
      return Number(a) > (b as number);
    if (aType === "number" && bType === "bigint")
      return (a as number) > Number(b);
    throw new Error(`The types '${aType}' and '${bType}' cannot be compared`);
  }

  if (aType === "number" && bType === "number") {
    if (Number.isNaN(a) || Number.isNaN(b))
      throw new TypeError("Comparison not supported for NaN values");
    return a > b;
  }

  if (a instanceof Date && b instanceof Date) {
    if (isNaN(a.getTime()) || isNaN(b.getTime()))
      throw new TypeError("Invalid Date objects are not comparable");
    return a.getTime() > b.getTime();
  }

  throw new TypeError(
    `Unsupported types for greaterThan comparison: '${aType}'`
  );
}
