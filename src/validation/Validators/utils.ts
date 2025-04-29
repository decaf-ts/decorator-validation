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

  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current !== null && typeof current === "object" && part in current) {
      current = (current as Record<string, any>)[part];
    } else {
      throw new Error(
        `Failed to resolve path ${path}: property '${part}' does not exist.`
      );
    }
  }
  return current as T;
}

/**
 * @summary Compares two values to determine if the first is less than the second.
 * @description Supports numbers and dates. Throws an error for unsupported types.
 *
 * @param {unknown} a - The first value to compare.
 * @param {unknown} b - The second value to compare against.
 *
 * @returns {boolean} True if `a` is less than `b`, false otherwise.
 *
 * @throws {Error} If the types of `a` or `b` are not comparable (number or Date).
 */
export function isLessThan(a: unknown, b: unknown): boolean {
  if (a == null || b == null) {
    throw new Error("Cannot compare null or undefined values");
  }

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
    throw new Error(
      `Cannot compare values of different types: '${aType}' and '${bType}'`
    );
  }

  if (typeof a === "number" && typeof b === "number") {
    if (Number.isNaN(a) || Number.isNaN(b)) {
      throw new Error("Cannot compare NaN values");
    }
    return a < b;
  }

  if (a instanceof Date && b instanceof Date) {
    if (isNaN(a.getTime()) || isNaN(b.getTime())) {
      throw new Error("Cannot compare invalid Date objects");
    }
    return a.getTime() < b.getTime();
  }

  throw new Error(`Unsupported types for lessThan comparison: '${aType}'`);
}

/**
 * Checks if `a` is greater than `b`.
 * Supports comparison for numbers and Date objects.
 *
 * @param {unknown} a - The value to validate.
 * @param {unknown} b - The value to compare against.
 * @returns {boolean} True if `a` is greater than `b`, otherwise false.
 */
export function isGreaterThan(a: unknown, b: unknown): boolean {
  // Handle undefined or null values
  if (a == null || b == null) return false;

  // Handle number comparison
  if (typeof a === "number" && typeof b === "number") return a > b;

  // Handle Date comparison
  if (a instanceof Date && b instanceof Date) {
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return false;
    return a.getTime() > b.getTime();
  }

  return false;
}
