/**
 * Basic Registry Interface
 * @typedef T
 * @interface IRegistry<T>
 */
export interface IRegistry<T>{
    register(obj: T, ...args: any[]): void;
    get(key: any, ...args: any[]): T | undefined;
}

/**
 * Basic Builder Registry Interface
 * @typedef T
 * @interface BuilderRegistry<T>
 */
export interface BuilderRegistry<T>{
    get(name: string, ...args: any[]): {new(): T} | undefined;
    register(name: string, constructor: any, ...args: any[]): void;
    build(obj: {[indexer: string]: any}, ...args: any[]): T;
}