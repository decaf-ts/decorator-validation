import { apply, metadata } from "@decaf-ts/reflection";
import { ModelKeys } from "./constants";

export function prop(key: string = ModelKeys.ATTRIBUTE): PropertyDecorator {
  return (model: object, propertyKey: string | symbol): void => {
    let props: string[];
    if (Object.prototype.hasOwnProperty.call(model, key)) {
      props = (model as any)[key];
    } else {
      props = (model as any)[key] = [];
    }
    if (!props.includes(propertyKey as string))
      props.push(propertyKey as string);
  };
}

export function propMetadata<V>(key: string, value: any): PropertyDecorator {
  return apply(prop(), metadata<V>(key, value));
}
