import "reflect-metadata";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type CustomDecorator<V> =
  | MethodDecorator
  | ClassDecorator
  | PropertyDecorator;

/**
 * Decorator that assigns metadata to the class/function using the
 * specified `key`.
 *
 * Requires two parameters:
 * - `key` - a value defining the key under which the metadata is stored
 * - `value` - metadata to be associated with `key`
 *
 * This metadata can be reflected using the `Reflector` class.
 *
 * Example: `@SetMetadata('roles', ['admin'])`
 *
 * @see [Reflection](https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata)
 *
 * @publicApi
 */
export function metadata<V>(key: string, value: V): CustomDecorator<V> {
  const decoratorFactory = (target: object, key?: any, descriptor?: any) => {
    if (descriptor) {
      Reflect.defineMetadata(key, value, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(key, value, target);
    return target;
  };
  return decoratorFactory;
}
