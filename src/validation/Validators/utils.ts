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
