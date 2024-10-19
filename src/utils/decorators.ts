import { apply, metadata } from "@decaf-ts/reflection";
import { ModelKeys } from "./constants";

export function prop(): PropertyDecorator {
  return (model: object, propertyKey: string | symbol): void => {
    let props: string[];
    if (Object.prototype.hasOwnProperty.call(model, ModelKeys.ATTRIBUTE)) {
      props = (model as any)[ModelKeys.ATTRIBUTE];
    } else {
      props = (model as any)[ModelKeys.ATTRIBUTE] = [];
    }
    props.push(propertyKey as string);
  };
}

export function propMetadata<V>(key: string, value: any): PropertyDecorator {
  return apply(prop(), metadata<V>(key, value));
}
