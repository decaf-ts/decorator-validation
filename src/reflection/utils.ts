import { Model } from "../model/Model";
import { ModelKeys } from "../utils/constants";
import { sf } from "../utils/strings";
import { isEqual } from "../utils/equality";
import "reflect-metadata";
import { DecoratorMetadata } from "../validation";

/**
 * @summary Util function to retrieve the decorators for the provided Property
 *
 * @param {string} annotationPrefix
 * @param {any} target
 * @param {string | symbol} propertyName
 * @param {boolean} [ignoreType] defaults to false. decides if the {@link ModelKeys.TYPE} is ignored or not
 * @param {boolean} [recursive] defaults to true. decides if it should climb the prototypal tree searching for more decorators on that property
 * @param {DecoratorMetadata[]} [accumulator] used when recursive is true, to cache decorators while it climbs the prototypal tree
 *
 * @function getPropertyDecorators
 * @memberOf module:decorator-validation.Reflection
 * @category Reflection
 */
export function getPropertyDecorators(
  annotationPrefix: string,
  target: any,
  propertyName: string | symbol,
  ignoreType: boolean = false,
  recursive = true,
  accumulator?: DecoratorMetadata[],
): { prop: string; decorators: DecoratorMetadata[] } {
  const getPropertyDecoratorsForModel = function (
    annotationPrefix: string,
    target: any,
    propertyName: string | symbol,
    ignoreType: boolean = false,
    accumulator?: DecoratorMetadata[],
  ): { prop: string; decorators: DecoratorMetadata[] } {
    // get info about keys that used in current property
    const keys: any[] = Reflect.getMetadataKeys(target, propertyName);
    const decorators: DecoratorMetadata[] = keys
      // filter your custom decorators
      .filter((key) => {
        if (ignoreType) return key.toString().startsWith(annotationPrefix);
        return (
          key === ModelKeys.TYPE || key.toString().startsWith(annotationPrefix)
        );
      })
      .reduce((values, key) => {
        // get metadata value.
        const currValues = {
          key:
            key !== ModelKeys.TYPE
              ? key.substring(annotationPrefix.length)
              : key,
          props: Reflect.getMetadata(key, target, propertyName),
        };
        return values.concat(currValues);
      }, accumulator || []);

    return {
      prop: propertyName.toString(),
      decorators: decorators,
    };
  };

  const result: { prop: string; decorators: DecoratorMetadata[] } =
    getPropertyDecoratorsForModel(
      annotationPrefix,
      target,
      propertyName,
      ignoreType,
      accumulator,
    );

  const trim = function (items: DecoratorMetadata[]) {
    const cache: Record<string, DecoratorMetadata> = {};
    return items.filter((item: DecoratorMetadata) => {
      if (item.key in cache) {
        if (!isEqual(item.props, cache[item.key]))
          console.log(
            sf(
              "Found a similar decorator for the {0} property of a {1} model but with different attributes. The original one will be kept",
              item.key,
              target.constructor.name,
            ),
          );
        return false;
      }

      cache[item.key.toString()] = item.props as DecoratorMetadata;
      return true;
    });
  };

  if (!recursive || Object.getPrototypeOf(target) === Object.prototype) {
    return {
      prop: result.prop,
      decorators: trim(result.decorators),
    };
  }

  // We choose to ignore type here, because in inheritance the expected type is from the lowest child class
  return getPropertyDecorators(
    annotationPrefix,
    Object.getPrototypeOf(target.constructor),
    propertyName,
    true,
    recursive,
    result.decorators,
  );
}

/**
 * @summary gets the prop type from the decorator
 * @param {any} model
 * @param {string | symbol} propKey
 * @return {string | undefined}
 *
 * @function geTypeFromDecorators
 *
 * @memberOf module:decorator-validation.Reflection
 */
export function getTypeFromDecorator(
  model: any,
  propKey: string | symbol,
): string | undefined {
  const decorators: { prop: string | symbol; decorators: any[] } =
    getPropertyDecorators(ModelKeys.REFLECT, model, propKey, false);
  if (!decorators || !decorators.decorators) return;

  // TODO handle @type decorators. for now we stick with design:type
  const typeDecorator = decorators.decorators.shift();
  const name = typeDecorator.props ? typeDecorator.props.name : undefined;
  return name !== "Function" ? name : undefined;
}

/**
 * @summary Retrieves the decorators for an object's properties prefixed by {@param prefixes}
 *
 * @param {T} model
 * @param {string[]} prefixes
 *
 * @function getAllPropertyDecorators
 *
 * @memberOf module:db-decorators.Reflection
 */
export function getAllPropertyDecorators<T extends Model>(
  model: T,
  ...prefixes: string[]
): Record<string, DecoratorMetadata[]> | undefined {
  if (!prefixes || !prefixes.length) return;

  function pushOrCreate(
    accum: Record<string, DecoratorMetadata[]>,
    key: string,
    decorators: DecoratorMetadata[],
  ): Record<string, DecoratorMetadata[]> {
    if (!decorators || !decorators.length) return;
    if (!accum[key]) accum[key] = [];
    accum[key].push(...decorators);
  }

  return Object.getOwnPropertyNames(model).reduce(
    (accum: Record<string, any> | undefined, propKey) => {
      prefixes.forEach((p, index) => {
        const decorators: {
          prop: string;
          decorators: DecoratorMetadata[];
        } = getPropertyDecorators(p, model, propKey, index !== 0);
        if (!accum) accum = {};
        pushOrCreate(accum, propKey, decorators.decorators);
      });
      return accum;
    },
    undefined,
  );
}

/**
 * @summary Retrieves all properties of an object
 * @description
 *  - and of all its prototypes if {@param climbTree} until it reaches {@param stopAt} (or ends the prototype chain)
 *
 * @param obj
 * @param {boolean} [climbTree] default to true
 * @param {string} [stopAt] defaults to 'Object'
 *
 * @function getAllProperties
 *
 * @memberOf module:decorator-validation.Model
 */
export function getAllProperties(
  obj: Record<any, any>,
  climbTree = true,
  stopAt = "Object",
) {
  const allProps: string[] = [];
  let curr: Record<any, any> = obj;

  const keepAtIt = function () {
    if (!climbTree) return;
    const prototype = Object.getPrototypeOf(curr);
    if (!prototype || prototype.constructor.name === stopAt) return;
    curr = prototype;
    return curr;
  };

  do {
    const props = Object.getOwnPropertyNames(curr);
    props.forEach(function (prop) {
      if (allProps.indexOf(prop) === -1) allProps.push(prop);
    });
  } while (keepAtIt());
  return allProps;
}

/**
 * @summary Util function to retrieve the Class decorators
 *
 * @function getClassDecorators
 * @memberOf module:decorator-validation.Reflection
 * @category Reflection
 */
export function getClassDecorators(
  annotationPrefix: string,
  target: any,
): { key: string; props: any }[] {
  const keys: any[] = Reflect.getOwnMetadataKeys(target.constructor);

  return keys
    .filter((key) => key.toString().startsWith(annotationPrefix))
    .reduce((values, key) => {
      // get metadata value
      const currValues = {
        key: key.substring(annotationPrefix.length),
        props: Reflect.getMetadata(key, target.constructor),
      };
      return values.concat(currValues);
    }, []);
}

/**
 * @summary Util function to check a type according to a typeName
 *
 * @param {any} value
 * @param {string} acceptedType
 * @return {boolean} true for a match, false otherwise
 *
 * @function checkType
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function checkType(value: any, acceptedType: string) {
  if (typeof value === acceptedType) return true;
  return (
    value.constructor &&
    value.constructor.name.toLowerCase() === acceptedType.toLowerCase()
  );
}

/**
 * @summary Util function to check a type according multiple possibilities
 * @param {any} value
 * @param {string[]} acceptedTypes
 * @return {boolean} true if any is a match, false otherwise
 *
 * @function checkTypes
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function checkTypes(value: any, acceptedTypes: string[]) {
  return !acceptedTypes.every((t) => !checkType(value, t));
}

/**
 * @summary The model type
 *
 * @param {any} value
 * @param {string | string[] | {name: string}} types
 *
 * @function evaluateDesignTypes
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function evaluateDesignTypes(
  value: any,
  types: string | string[] | { name: string },
) {
  switch (typeof types) {
    case "string":
      return checkType(value, types);
    case "object":
      if (Array.isArray(types)) return checkTypes(value, types);
      return true;
    case "function":
      if (types.name && types.name !== "Object")
        return checkType(value, types.name);
      return true;
    default:
      return true;
  }
}

/**
 * @summary For Serialization/deserialization purposes.
 * @description Reads the {@link ModelKeys.ANCHOR} property of a {@link Model} to discover the class to instantiate
 *
 * @function isModel
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function isModel(target: Record<string, any>) {
  return (
    !!target[ModelKeys.ANCHOR] ||
    !!getClassDecorators(ModelKeys.REFLECT, target).find(
      (dec) => dec.key === ModelKeys.MODEL && dec.props && dec.props.class,
    )
  );
}
