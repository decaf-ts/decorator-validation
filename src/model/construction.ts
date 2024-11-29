import { Model } from "./Model";

/**
 * @summary Helper Function to override constructors
 *
 * @param {Function} constructor
 * @param {any[]} [args]
 * @return {T} the new instance
 *
 * @function construct
 * @memberOf module:decorator-validation.Construction
 */
export function construct<T extends Model>(
  constructor: any,
  ...args: any[]
): T {
  const _constr = (...argz: any[]) => new constructor(...argz);
  _constr.prototype = constructor.prototype;
  return _constr(...args);
}

/**
 * @summary Recursively finds the last prototype before Object
 * @param {object} obj
 *
 * @function findLastProtoBeforeObject
 * @memberOf module:decorator-validation.Construction
 */
export function findLastProtoBeforeObject(obj: object): object {
  let prototype: any = Object.getPrototypeOf(obj);
  if (prototype === Object.prototype) return obj;
  while (prototype !== Object.prototype) {
    prototype = Object.getPrototypeOf(prototype);
    if (prototype === Object.prototype) return prototype;
    if (Object.getPrototypeOf(prototype) === Object.prototype) return prototype;
  }
  throw new Error("Could not find proper prototype");
}

/**
 * @sumary binds the {@link Model} class as a root prototype of the provided instance
 *
 * @param {unknown} obj
 *
 * @function bindModelPrototype
 * @memberOf module:decorator-validation.Construction
 */
export function bindModelPrototype(obj: unknown) {
  if (obj instanceof Model) return;

  function bindPrototype(objToOverride: unknown, prototype: object) {
    Object.setPrototypeOf(objToOverride, prototype);
  }

  const prototype: any = Object.getPrototypeOf(obj);
  if (prototype === Object.prototype) {
    return bindPrototype(obj, Model.prototype);
  }
  while (prototype !== Object.prototype) {
    const prot = Object.getPrototypeOf(prototype);
    if (
      prot === Object.prototype ||
      Object.getPrototypeOf(prot) === Object.prototype
    ) {
      return bindPrototype(prototype, Model.prototype);
    }
  }
  throw new Error("Could not find proper prototype to bind");
}
