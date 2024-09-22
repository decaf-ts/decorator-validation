import "reflect-metadata";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type CustomDecorator<V> = MethodDecorator &
  ClassDecorator &
  PropertyDecorator;

/**
 * @summary Decorator that assigns metadata to the class/method using the
 * specified `key`.
 *
 * @param {string} key a value defining the key under which the metadata is stored
 * @param {any} value metadata to be associated with `key`
 *
 * @function metadata
 *
 * @memberOf module:decorator-validation.Reflections
 * @category Decorators
 */
export function metadata<V>(key: string, value: V): CustomDecorator<V> {
  return (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata(key, value, descriptor.value); // method
    } else if (propertyKey) {
      Reflect.defineMetadata(key, value, target, propertyKey); // property
    } else {
      Reflect.defineMetadata(key, value, target); // class
    }
  };
}
