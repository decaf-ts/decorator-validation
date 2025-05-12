import { Constructor } from "../model/types";

/**
 * @summary Basic interface for Registries
 *
 * @interface IRegistry
 *
 * @category Model
 */
export interface IRegistry<T> {
  /**
   * @summary Registers an Object
   *
   * @param {T} obj
   * @param {any[]} args
   *
   * @method
   */
  register(obj: T | any, ...args: any[]): void;

  /**
   * @summary Retrieves an Object if it can find it
   *
   * @param {any} key
   * @param {any[]} args
   * @return {T | undefined}
   *
   * @method
   */
  get(key: any, ...args: any[]): T | undefined;
}

/**
 * @summary Basic Builder Registry Interface
 *
 * @template T
 * @interface BuilderRegistry<T>
 *
 * @category Model
 */
export interface BuilderRegistry<T> extends IRegistry<Constructor<T>> {
  /**
   * @summary Retrieves an Builder Object by name if it can
   *
   * @param {string} name
   * @param {any[]} args
   *
   * @method
   */
  get(name: string, ...args: any[]): Constructor<T> | undefined;

  /**
   * @summary Registers a constructor by name
   *
   * @param {Constructor<T>} [constructor]
   * @param {name} name
   * @param {any[]} args
   *
   * @method
   */
  register(constructor: Constructor<T>, name?: string, ...args: any[]): void;

  /**
   * @summary Builds an Object by name
   *
   * @param {{}} obj
   * @param {any[]} args
   * @return T
   *
   * @method
   */
  build(obj: Record<string, any> | T, ...args: any[]): T;
}
