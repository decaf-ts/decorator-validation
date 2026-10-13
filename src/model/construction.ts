import { Model } from "./Model";

/**
 * @description Helper function to create an instance by invoking a constructor with dynamic arguments.
 * @summary Overrides standard construction patterns by wrapping the given constructor to allow spread argument invocation while preserving the prototype chain.
 * @template M the model instance type
 * @param {any} constructor The constructor function to invoke.
 * @param {...any[]} args Optional arguments to pass to the constructor.
 * @return {M} The newly constructed instance.
 * @function construct
 * @memberOf module:decorator-validation
 */
export function construct<M extends Model>(
  constructor: any,
  ...args: any[]
): M {
  const _constr = (...argz: any[]) => new constructor(...argz);
  _constr.prototype = constructor.prototype;
  return _constr(...args);
}

/**
 * @description Recursively finds the last prototype in the chain before reaching Object.prototype.
 * @summary Walks up the prototype chain to locate the most derived prototype that still precedes the base Object prototype.
 * @param {object} obj The object whose prototype chain will be inspected.
 * @return {object} The last prototype before Object.prototype, or the input object if its prototype is Object.prototype.
 * @function findLastProtoBeforeObject
 * @memberOf module:decorator-validation
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
 * @description Binds Model.prototype as the root of the provided object's prototype chain when the object is not already a Model.
 * @summary Ensures objects created outside of the Model inheritance chain gain Model as their ultimate prototype to access model utilities. Plain objects whose direct prototype is Object.prototype are bound directly to Model.prototype; for deeper chains, walks up to the root prototype (the last one whose parent is Object.prototype) and sets that prototype's parent to Model.prototype instead, preserving the intermediate ancestors.
 * @param {unknown} obj The object to bind to the Model prototype chain.
 * @return {void}
 * @function bindModelPrototype
 * @mermaid
 * sequenceDiagram
 *   participant Caller
 *   participant Fn as bindModelPrototype
 *   participant M as Model.prototype
 *   Caller->>Fn: obj
 *   alt obj instanceof Model
 *     Fn-->>Caller: return
 *   else obj chain ends at Object.prototype
 *     Fn->>Fn: setPrototypeOf(obj, M)
 *     Fn-->>Caller: return
 *   else deep prototype chain
 *     Fn->>Fn: walk up to root prototype (parent is Object.prototype)
 *     Fn->>Fn: setPrototypeOf(rootProto, M)
 *     Fn-->>Caller: return
 *   end
 * @memberOf module:decorator-validation
 */
export function bindModelPrototype(obj: unknown) {
  if (obj instanceof Model) return;

  function bindPrototype(objToOverride: unknown, prototype: object) {
    Object.setPrototypeOf(objToOverride, prototype);
  }

  let prototype: any = Object.getPrototypeOf(obj);
  if (prototype === Object.prototype) {
    return bindPrototype(obj, Model.prototype);
  }
  while (Object.getPrototypeOf(prototype) !== Object.prototype) {
    prototype = Object.getPrototypeOf(prototype);
  }
  return bindPrototype(prototype, Model.prototype);
}
