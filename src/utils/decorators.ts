import { apply, metadata } from "@decaf-ts/reflection";
import { ModelKeys } from "./constants";

/**
 * @description Property decorator factory for model attributes
 * @summary Creates a decorator that marks class properties as model attributes
 *
 * @param {string} [key=ModelKeys.ATTRIBUTE] - The metadata key under which to store the property name
 * @return {function(object, any?): void} - Decorator function that registers the property
 * @function prop
 * @category Property Decorators
 *
 * @mermaid
 * sequenceDiagram
 *    participant D as Decorator
 *    participant M as Model
 *
 *    D->>M: Check if key exists
 *    alt key exists
 *        M-->>D: Return existing props array
 *    else key doesn't exist
 *        D->>M: Create new props array
 *    end
 *    D->>M: Check if property exists
 *    alt property not in array
 *        D->>M: Add property to array
 *    end
 */
export function prop(key: string = ModelKeys.ATTRIBUTE) {
  return (model: object, propertyKey?: any): void => {
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

/**
 * @description Combined property decorator factory for metadata and attribute marking
 * @summary Creates a decorator that both marks a property as a model attribute and assigns metadata to it
 *
 * @template V
 * @param {string} key - The metadata key
 * @param {V} value - The metadata value to associate with the property
 * @return {Function} - Combined decorator function
 * @function propMetadata
 * @category Property Decorators
 */
export function propMetadata<V>(key: string, value: V) {
  return apply(prop(), metadata<V>(key, value));
}
