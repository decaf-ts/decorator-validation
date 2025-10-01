import { ConditionalAsync } from "../types";

/**
 * Wraps a value in a Promise if the `async` flag is true.
 *
 * @template T - The type of the value being wrapped.
 * @template Async - A boolean type that determines if the result should be wrapped in a Promise.
 *
 * @param value - The value to return directly or wrap in a Promise.
 * @param async - If true, the value is wrapped in a resolved Promise. If false or undefined, the value is returned as-is.
 *
 * @returns The original value or a Promise resolving to it, depending on the `async` flag.
 */
export function toConditionalPromise<T, Async extends boolean>(
  value: T,
  async?: Async
): ConditionalAsync<Async, T> {
  return (async ? Promise.resolve(value) : value) as ConditionalAsync<Async, T>;
}
