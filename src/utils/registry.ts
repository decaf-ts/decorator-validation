/**
 * Basic Registry Interface
 * @typedef T
 * @interface IRegistry<T>
 *
 * @memberOf decorator-validation.utils
 */
export interface IRegistry<T>{
    /**
     * Registers an Object
     *
     * @param {T} obj
     * @param {any[]} args
     */
    register(obj: T, ...args: any[]): void;

    /**
     * Retrieves an Object if it can find it
     *
     * @param {any} key
     * @param {any[]} args
     * @return {T | undefined}
     */
    get(key: any, ...args: any[]): T | undefined;
}

/**
 * Basic Builder Registry Interface
 *
 * @typedef T
 * @interface BuilderRegistry<T>
 *
 * @memberOf decorator-validation.utils
 */
export interface BuilderRegistry<T>{
    /**
     * Retrieves an Builder Object by name if it can
     *
     * @param {string} name
     * @param {any[]} args
     * @memberOf BuilderRegistry
     */
    get(name: string, ...args: any[]): {new(): T} | undefined;

    /**
     * Registers a constructor by name
     *
     * @param {name} name
     * @param {any} constructor
     * @param {any[]} args
     * @memberOf BuilderRegistry
     */
    register(name: string, constructor: any, ...args: any[]): void;

    /**
     * Builds an Object by name
     *
     * @param {{}} obj
     * @param {any[]} args
     * @return T
     * @memberOf BuilderRegistry
     */
    build(obj: {[indexer: string]: any}, ...args: any[]): T;
}