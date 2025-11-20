/**
 * @description Enhanced algorithm for deep comparison of any two values with optional ignored properties
 * @summary Performs a deep equality check between two values, handling various types including primitives, objects, arrays, dates, and more
 * @param {unknown} a - First value to compare
 * @param {unknown} b - Second value to compare
 * @param {string[]} propsToIgnore - A list of property names to ignore during comparison
 * @return {boolean} Returns true if the values are deeply equal, false otherwise
 * @function isEqual
 * @mermaid
 * sequenceDiagram
 *   participant Caller
 *   participant isEqual
 *   participant Recursion
 *
 *   Caller->>isEqual: isEqual(a, b, propsToIgnore)
 *   Note over isEqual: Check simple cases (identity, null, primitives)
 *
 *   alt a === b
 *     isEqual-->>Caller: true (with special case for +0/-0)
 *   else a or b is null
 *     isEqual-->>Caller: a === b
 *   else different types
 *     isEqual-->>Caller: false
 *   else both NaN
 *     isEqual-->>Caller: true
 *   else primitive types
 *     isEqual-->>Caller: a === b
 *   else both Date objects
 *     isEqual-->>Caller: Compare timestamps
 *   else both RegExp objects
 *     isEqual-->>Caller: Compare string representations
 *   else both Error objects
 *     isEqual-->>Caller: Compare name and message
 *   else both Arrays
 *     Note over isEqual: Check length
 *     loop For each element
 *       isEqual->>Recursion: isEqual(a[i], b[i], propsToIgnore)
 *     end
 *   else both Maps or Sets
 *     Note over isEqual: Compare size and entries
 *   else both TypedArrays
 *     Note over isEqual: Compare byte by byte
 *   else both Objects
 *     Note over isEqual: Filter keys by propsToIgnore
 *     Note over isEqual: Compare key counts
 *     loop For each key
 *       isEqual->>Recursion: isEqual(a[key], b[key], propsToIgnore)
 *     end
 *     Note over isEqual: Check Symbol properties
 *     Note over isEqual: Compare prototypes
 *   end
 *
 *   isEqual-->>Caller: Comparison result
 * @memberOf module:decorator-validation
 */
export function isEqual(
  a: unknown,
  b: unknown,
  ...propsToIgnore: string[]
): boolean {
  // Handle simple cases
  if (a === b) {
    // Special case for +0 and -0
    return a !== 0 || 1 / (a as number) === 1 / (b as number);
  }
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;

  // Handle NaN
  if (Number.isNaN(a) && Number.isNaN(b)) return true;

  // Handle primitive types
  if (typeof a !== "object") return a === b;

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    // Check if both dates are invalid
    if (isNaN(a.getTime()) && isNaN(b.getTime())) return true;
    return a.getTime() === b.getTime();
  }

  // Handle RegExp objects
  if (a instanceof RegExp && b instanceof RegExp)
    return a.toString() === b.toString();

  // Handle Error objects
  if (a instanceof Error && b instanceof Error) {
    return a.name === b.name && a.message === b.message;
  }

  // Handle Array objects
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i], ...propsToIgnore)) return false;
    }
    return true;
  }

  // Handle Map objects
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, value] of a) {
      if (!b.has(key) || !isEqual(value, b.get(key), ...propsToIgnore))
        return false;
    }
    return true;
  }

  // Handle Set objects
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  }

  // Handle TypedArray objects
  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
    if (a.byteLength !== b.byteLength) return false;
    if (a.byteOffset !== b.byteOffset) return false;
    if (a.buffer.byteLength !== b.buffer.byteLength) return false;

    const uint8A = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    const uint8B = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);

    for (let i = 0; i < uint8A.length; i++) {
      if (uint8A[i] !== uint8B[i]) return false;
    }
    return true;
  }

  // Handle other objects
  const aKeys = Object.keys(a).filter((k) => !propsToIgnore.includes(k));
  const bKeys = Object.keys(b).filter((k) => !propsToIgnore.includes(k));

  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!bKeys.includes(key)) return false;
    if (
      !isEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        ...propsToIgnore
      )
    )
      return false;
  }

  // Handle Symbol properties
  const aSymbols = Object.getOwnPropertySymbols(a).filter(
    (s) => !propsToIgnore.includes(s.toString())
  );
  const bSymbols = Object.getOwnPropertySymbols(b).filter(
    (s) => !propsToIgnore.includes(s.toString())
  );

  if (aSymbols.length !== bSymbols.length) return false;

  for (const sym of aSymbols) {
    if (!bSymbols.includes(sym)) return false;
    if (
      !isEqual(
        (a as Record<symbol, unknown>)[sym],
        (b as Record<symbol, unknown>)[sym],
        ...propsToIgnore
      )
    )
      return false;
  }

  // Add this check right before the final return statement
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
    return false;
  }

  return true;
}
