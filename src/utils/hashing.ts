import { Model } from "../model/Model";

/**
 * @summary Mimics Java's String's Hash implementation
 *
 * @param {string | number | symbol | Date} obj
 * @return {number} hash value of obj
 *
 * @function hashCode
 * @memberOf module:decorator-validation.Utils.Hashing
 * @category Hashing
 */
export function hashCode(obj: string | number | symbol | Date) {
  obj = String(obj);
  let hash = 0;
  for (let i = 0; i < obj.length; i++) {
    const character = obj.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * @summary Defines teh type for a Hashing function
 * @memberOf module:decorator-validation.Utils.Hashing
 * @category Hashing
 */
export type HashingFunction = (value: any) => string | number;

/**
 * @summary Hashes an object serializing it and then hashing the string
 * @description The Serialization algorithm used by default (JSON.stringify)
 * is not deterministic and should not be used for hashing
 *
 * @param {Record<string, any>} obj
 * @return {string} the resulting hash
 *
 * @function hashSerialization
 * @memberOf module:decorator-validation.Utils.Hashing
 *
 * @category Hashing
 */
export function hashSerialization(obj: Record<string, any> | any[]) {
  return hashCode(Model.serialize(obj));
}

/**
 * @summary Hashes an object by combining the hash of all its properties
 *
 * @param {Record<string, any>} obj
 * @return {string} the resulting hash
 *
 * @function hashObj
 * @memberOf module:decorator-validation.Utils.Hashing
 * @category Hashing
 */
export function hashObj(obj: Record<string, any> | any[]) {
  const hashReducer = function (h: number | string, el: any): string | number {
    const elHash = hashFunction(el);

    if (typeof elHash === "string")
      return hashFunction(((h as string) || "") + hashFunction(el));

    h = h || 0;
    h = ((h as number) << 5) - (h as number) + elHash;
    return h & h;
  };

  const func: HashingFunction = hashCode;

  const hashFunction = function (value: any): string | number {
    if (typeof value === "undefined") return "";
    if (["string", "number", "symbol"].indexOf(typeof value) !== -1)
      return func(value.toString());
    if (value instanceof Date) return func(value.getTime());
    if (Array.isArray(value)) return value.reduce(hashReducer, undefined);
    return (Object.values(value) as (string | number)[]).reduce(
      hashReducer,
      undefined as unknown as string | number,
    );
  };

  const result = Object.values(obj).reduce(hashReducer, 0);

  return typeof result === "number" ? Math.abs(result) : result;
}
