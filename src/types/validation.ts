import { DecoratorMetadata } from "@decaf-ts/reflection";
import { Model, ModelErrorDefinition } from "../model";

/**
 * @description Conditionally wraps a type in a `Promise` based on the `Async` flag.
 * @summary Utility type that resolves to `T` if `Async` is `false`, or to `Promise<T>` if `Async` is `true`.
 * Used to abstract the return type of functions that may be either synchronous or asynchronous depending on a flag.
 *
 * @template Async A boolean flag indicating whether the result should be asynchronous (`true`) or synchronous (`false`).
 * @template T The base type to return directly or to wrap in a `Promise`.
 *
 * @example
 * ```typescript
 * // Synchronous result
 * type SyncResult: string | number = ConditionalAsync<false, string | number>;
 *
 * // Asynchronous result
 * type AsyncResult: Promise<string | number> = ConditionalAsync<true, string | number>;
 * ```
 * @memberOf module:decorator-validation
 */
export type ConditionalAsync<Async extends boolean, T> = Async extends true
  ? Promise<T>
  : T;

export type DecoratorMetadataAsync = DecoratorMetadata & { async?: boolean };

export type ModelConditionalAsync<M> =
  M extends Model<true>
    ? Promise<ModelErrorDefinition | undefined>
    : ModelErrorDefinition | undefined;
