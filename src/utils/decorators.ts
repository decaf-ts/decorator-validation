import { apply, metadata } from "@decaf-ts/reflection";
import { ModelKeys } from "./constants";

export function prop(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    const descriptor = Object.getOwnPropertyDescriptor(
      target,
      ModelKeys.ATTRIBUTE
    );
    const props: string[] = descriptor ? descriptor.value || [] : [];
    if (props.indexOf(propertyKey.toString()) === -1)
      props.push(propertyKey.toString());
    Object.defineProperty(target, ModelKeys.ATTRIBUTE, {
      enumerable: false,
      configurable: true,
      writable: false,
      value: props,
    });
  };
}

export function propMetadata<V>(key: string, value: any): PropertyDecorator {
  return apply(prop(), metadata<V>(key, value));
}
