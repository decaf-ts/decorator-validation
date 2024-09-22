/**
 * @summary Deep Object Comparison
 * @description algorithm from {@link https://stackoverflow.com/questions/30476150/javascript-deep-comparison-recursively-objects-and-properties}
 * but with optional ignored properties
 *
 * @param {any} a
 * @param {any} b
 * @param {string} [propsToIgnore]
 *
 * @function isEqual
 * @memberOf module:decorator-validation.Utils.Equality
 * @category Validation
 */
export function isEqual(a: any, b: any, ...propsToIgnore: string[]): boolean {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (!a || !b || (typeof a !== "object" && typeof b !== "object"))
    return a === b;
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  if (typeof a !== typeof b) return false;
  if (a.prototype !== b.prototype) return false;
  const keys = Object.keys(a).filter((k) => propsToIgnore.indexOf(k) === -1);
  if (
    keys.length !==
    Object.keys(b).filter((k) => propsToIgnore.indexOf(k) === -1).length
  )
    return false;
  return keys.every(
    (k) =>
      propsToIgnore.indexOf(k) !== -1 || isEqual(a[k], b[k], ...propsToIgnore),
  );
}
