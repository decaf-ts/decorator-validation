import { Model } from "./Model";
import { ValidationKeys } from "../validation/Validators/constants";
import { jsTypes, ReservedModels } from "./constants";
import { ModelKeys } from "../utils/constants";
import { sf } from "../utils/strings";
import { getPropertyDecorators, DecoratorMetadata } from "@decaf-ts/reflection";
import { isModel } from "./utils";

/**
 * @summary Repopulates the Object properties with the ones from the new object
 * @description Iterates all common properties of obj (if existing) and self, and copies them onto self
 *
 * @param {T} self
 * @param {T | Record<string, any>} [obj]
 *
 * @function constructFromObject
 * @memberOf module:decorator-validation.Construction
 * @category Construction
 */
export function constructFromObject<T extends Model>(
  self: T,
  obj?: T | Record<string, any>,
) {
  if (!obj) return self;
  for (const prop in obj) {
    if (prop === ModelKeys.METADATA) continue;
    if (
      obj.hasOwnProperty(prop) &&
      (self.hasOwnProperty(prop) ||
        ((self as any).prototype &&
          (self as any).prototype.hasOwnProperty(prop)))
    )
      (self as any)[prop] = (obj as any)[prop] || undefined;
  }

  if ((obj as Record<string, any>)[ModelKeys.METADATA])
    Object.defineProperty(self, ModelKeys.METADATA, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: (obj as Record<string, any>)[ModelKeys.METADATA],
    });
  return self;
}

/**
 * @summary Repopulates the instance with the ones from the new Model Object
 * @description Iterates all common properties of obj (if existing) and self, and copies them onto self.
 * Is aware of nested Model Objects and rebuilds them also.
 * When List properties are decorated with {@link list}, they list items will also be rebuilt
 *
 * @param {T} self
 * @param {T | Record<string, any>} [obj]
 *
 * @function constructFromModel
 * @memberOf module:decorator-validation.Construction
 * @category Construction
 */
export function constructFromModel<T extends Model>(
  self: T,
  obj?: T | Record<string, any>,
) {
  if (!obj) return self;

  let decorators: DecoratorMetadata[], dec: DecoratorMetadata;

  for (const prop in obj) {
    if (prop === ModelKeys.METADATA) continue;
    if (
      obj.hasOwnProperty(prop) &&
      (self.hasOwnProperty(prop) ||
        ((self as any).prototype &&
          (self as any).prototype.hasOwnProperty(prop)))
    ) {
      (self as Record<string, any>)[prop] = (obj as Record<string, any>)[prop];
      if (typeof (self as any)[prop] !== "object") continue;
      if (isModel((self as Record<string, any>)[prop])) {
        try {
          (self as Record<string, any>)[prop] = Model.build(
            (self as Record<string, any>)[prop],
          );
        } catch (e: any) {
          console.log(e);
        }
        continue;
      }

      const allDecorators: DecoratorMetadata[] = getPropertyDecorators(
        ValidationKeys.REFLECT,
        self,
        prop,
      ).decorators;
      decorators = allDecorators.filter(
        (d: DecoratorMetadata) =>
          [ModelKeys.TYPE, ValidationKeys.TYPE].indexOf(d.key) !== -1,
      );
      if (!decorators || !decorators.length)
        throw new Error(sf("failed to find decorators for property {0}", prop));
      dec = decorators.pop() as DecoratorMetadata;
      const clazz = dec.props.name
        ? [dec.props.name]
        : Array.isArray(dec.props.customTypes)
          ? dec.props.customTypes
          : [dec.props.customTypes];
      const reserved = Object.values(ReservedModels).map((v) =>
        v.toLowerCase(),
      ) as string[];

      clazz.forEach((c) => {
        if (reserved.indexOf(c.toLowerCase()) === -1)
          try {
            switch (c) {
              case "Array":
              case "Set":
                if (allDecorators.length) {
                  const listDec = allDecorators.find(
                    (d) => d.key === ValidationKeys.LIST,
                  );
                  if (listDec) {
                    const clazzName = listDec.props.class.find(
                      (t: string) => !jsTypes.includes(t.toLowerCase()),
                    );
                    if (c === "Array")
                      (self as Record<string, any>)[prop] = (
                        self as Record<string, any>
                      )[prop].map((el: any) => {
                        return ["object", "function"].includes(typeof el) &&
                          clazzName
                          ? Model.build(el, clazzName)
                          : el;
                      });
                    if (c === "Set") {
                      const s = new Set();
                      for (const v of (self as Record<string, any>)[prop]) {
                        ["object", "function"].includes(typeof v) && clazzName
                          ? s.add(Model.build(v, clazzName))
                          : s.add(v);
                      }
                      (self as Record<string, any>)[prop] = s;
                    }
                  }
                }
                break;
              default:
                if ((self as Record<string, any>)[prop])
                  (self as Record<string, any>)[prop] = Model.build(
                    (self as any)[prop],
                    c,
                  );
            }
          } catch (e: any) {
            console.log(e);
            // do nothing. we have no registry of this class
          }
      });
    }
  }
  if ((obj as Record<string, any>)[ModelKeys.METADATA])
    Object.defineProperty(self, ModelKeys.METADATA, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: (obj as Record<string, any>)[ModelKeys.METADATA],
    });
  return self;
}

/**
 * @summary Helper Function to override constructors
 *
 * @param {Function} constructor
 * @param {any[]} [args]
 * @return {T} the new instance
 *
 * @function construct
 * @memberOf module:decorator-validation.Construction
 * @category Construction
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
 * @summary Typo of a Model builder function
 * @memberOf module:decorator-validation.Construction
 * @category Construction
 */
export type ModelBuilderFunction = <T extends Model>(
  self: T,
  obj?: T | Record<string, any>,
) => T;

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

export function bindModelPrototype(obj: any) {
  if (obj instanceof Model) return;

  function bindPrototype(objToOverride: object, prototype: object) {
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
