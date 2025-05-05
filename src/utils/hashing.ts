/**
 * @summary Mimics Java's String's Hash implementation
 *
 * @param {string | number | symbol | Date} obj
 * @return {number} hash value of obj
 *
 * @function hashCode
 * @memberOf module:decorator-validation
 * @category Model
 */
export function hashCode(obj: string | number | symbol | Date): string {
  obj = String(obj);
  let hash = 0;
  for (let i = 0; i < obj.length; i++) {
    const character = obj.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

/**
 * @summary Defines teh type for a Hashing function
 * @memberOf module:decorator-validation
 * @category Model
 */
export type HashingFunction = (value: any, ...args: any[]) => string;

/**
 * @summary Hashes an object by combining the hash of all its properties
 *
 * @param {Record<string, any>} obj
 * @return {string} the resulting hash
 *
 * @function hashObj
 * @memberOf module:decorator-validation
 * @category Model
 */
export function hashObj(obj: Record<string, any> | any[]): string {
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
      undefined as unknown as string | number
    );
  };

  const result = Object.values(obj).reduce(hashReducer, 0);

  return (typeof result === "number" ? Math.abs(result) : result).toString();
}

export const DefaultHashingMethod = "default";

/**
 * @description Manages hashing methods and provides a unified hashing interface
 * @summary A utility class that provides a registry for different hashing functions and methods to hash objects.
 * The class maintains a cache of registered hashing functions and allows setting a default hashing method.
 * It prevents direct instantiation and provides static methods for registration and hashing.
 *
 * @class Hashing
 * @category Model
 *
 * @example
 * ```typescript
 * // Register a custom hashing function
 * Hashing.register('md5', (obj) => createMD5Hash(obj), true);
 *
 * // Hash an object using default method
 * const hash1 = Hashing.hash(myObject);
 *
 * // Hash using specific method
 * const hash2 = Hashing.hash(myObject, 'md5');
 * ```
 */
export class Hashing {
  /**
   * @description Current default hashing method identifier
   * @private
   */
  private static current: string = DefaultHashingMethod;

  /**
   * @description Cache of registered hashing functions
   * @private
   */
  private static cache: Record<string, HashingFunction> = {
    default: hashObj,
  };

  private constructor() {}

  /**
   * @description Retrieves a registered hashing function
   * @summary Fetches a hashing function from the cache by its key. Throws an error if the method is not registered.
   *
   * @param {string} key - The identifier of the hashing function to retrieve
   * @return {HashingFunction} The requested hashing function
   * @private
   */
  private static get(key: string): any {
    if (key in this.cache) return this.cache[key];
    throw new Error(`No hashing method registered under ${key}`);
  }

  /**
   * @description Registers a new hashing function
   * @summary Adds a new hashing function to the registry. Optionally sets it as the default method.
   * Throws an error if a method with the same key is already registered.
   *
   * @param {string} key - The identifier for the hashing function
   */
  static register(
    key: string,
    func: HashingFunction,
    setDefault = false
  ): void {
    if (key in this.cache)
      throw new Error(`Hashing method ${key} already registered`);
    this.cache[key] = func;
    if (setDefault) this.current = key;
  }

  static hash(obj: any, method?: string, ...args: any[]) {
    if (!method) return this.get(this.current)(obj, ...args);
    return this.get(method)(obj, ...args);
  }

  static setDefault(method: string) {
    this.current = this.get(method);
  }
}
