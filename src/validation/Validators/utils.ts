import { VALIDATION_PARENT_KEY } from "../../constants";
import { sf } from "../../utils/strings";
import { COMPARISON_ERROR_MESSAGES } from "./constants";

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
    throw new Error(sf(COMPARISON_ERROR_MESSAGES.INVALID_PATH, path));
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
        sf(COMPARISON_ERROR_MESSAGES.CONTEXT_NOT_OBJECT_COMPARISON, i + 1, path)
      );
    }

    if (!currentContext[VALIDATION_PARENT_KEY]) {
      throw new Error(
        sf(COMPARISON_ERROR_MESSAGES.NO_PARENT_COMPARISON, i + 1, path)
      );
    }

    currentContext = currentContext[VALIDATION_PARENT_KEY];
  }

  // Process dot notation path
  const parts = cleanPath.split(".");
  let currentValue: any = currentContext;

  for (const part of parts) {
    if (
      currentValue !== null &&
      typeof currentValue === "object" &&
      part in currentValue
    ) {
      currentValue = (currentValue as Record<string, any>)[part];
    } else {
      const errorMsgTemplate =
        parentLevel === 0
          ? COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_FOUND
          : parentLevel === 1
            ? COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_FOUND_ON_PARENT
            : COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_FOUND_AFTER_PARENT;

      throw new Error(sf(errorMsgTemplate, path, part, parentLevel));
    }
  }

  return currentValue as T;
}

const getTypeName = (value: unknown): string => {
  if (value === null) return "null";
  if (value instanceof Date) return "Date";
  if (Number.isNaN(value)) return "NaN";
  if (value === Infinity) return "Infinity";
  if (value === -Infinity) return "-Infinity";
  if (Array.isArray(value)) return "array";
  return typeof value;
};

const isSupported = (
  value: unknown
): value is undefined | number | bigint | Date => {
  if (value === undefined || value instanceof Date) return true;

  if (typeof value === "bigint") return true;

  // Numbers must be finite (excludes NaN, Infinity, -Infinity)
  if (typeof value === "number") return Number.isFinite(value);

  return false;
};

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
  if (isSupported(a) && isSupported(b)) return true;

  throw new TypeError(
    sf(
      COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
      getTypeName(a),
      getTypeName(b)
    )
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
    throw new Error(COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON);

  // Validate type compatibility
  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) {
    // Allow number X bigint
    if (aType === "bigint" && bType === "number")
      return Number(a) < (b as number);
    if (aType === "number" && bType === "bigint")
      return (a as number) < Number(b);
    throw new TypeError(
      sf(COMPARISON_ERROR_MESSAGES.TYPE_MISMATCH_COMPARISON, aType, bType)
    );
  }

  if (
    (aType === "number" && bType === "number") ||
    (aType === "bigint" && bType === "bigint")
  ) {
    if (Number.isNaN(a) || Number.isNaN(b))
      throw new TypeError(COMPARISON_ERROR_MESSAGES.NAN_COMPARISON);
    return a < b;
  }

  if (a instanceof Date && b instanceof Date) {
    if (isNaN(a.getTime()) || isNaN(b.getTime()))
      throw new TypeError(COMPARISON_ERROR_MESSAGES.INVALID_DATE_COMPARISON);
    return a.getTime() < b.getTime();
  }

  throw new TypeError(
    sf(
      COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
      getTypeName(a),
      getTypeName(b)
    )
  );
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
    throw new Error(COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON);

  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) {
    // Allow number X bigint
    if (aType === "bigint" && bType === "number")
      return Number(a) > (b as number);
    if (aType === "number" && bType === "bigint")
      return (a as number) > Number(b);
    throw new Error(
      sf(COMPARISON_ERROR_MESSAGES.TYPE_MISMATCH_COMPARISON, aType, bType)
    );
  }

  if (
    (aType === "number" && bType === "number") ||
    (aType === "bigint" && bType === "bigint")
  ) {
    if (Number.isNaN(a) || Number.isNaN(b))
      throw new TypeError(COMPARISON_ERROR_MESSAGES.NAN_COMPARISON);
    return a > b;
  }

  if (a instanceof Date && b instanceof Date) {
    if (isNaN(a.getTime()) || isNaN(b.getTime()))
      throw new TypeError(COMPARISON_ERROR_MESSAGES.INVALID_DATE_COMPARISON);
    return a.getTime() > b.getTime();
  }

  throw new TypeError(
    sf(
      COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
      getTypeName(a),
      getTypeName(b)
    )
  );
}
