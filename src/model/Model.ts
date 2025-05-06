import { Serialization } from "../utils/serialization";
import { BuilderRegistry } from "../utils/registry";
import { ModelErrorDefinition } from "./ModelErrorDefinition";
import {
  Comparable,
  Constructor,
  Hashable,
  ModelArg,
  ModelBuilderFunction,
  ModelConstructor,
  Serializable,
  Validatable,
} from "./types";
import { DecoratorMetadata, isEqual, Reflection } from "@decaf-ts/reflection";
import { validate } from "./validation";
import { Hashing } from "../utils/hashing";
import { ModelKeys } from "../utils/constants";
import { ValidationKeys } from "../validation/Validators/constants";
import { sf } from "../utils/strings";
import { jsTypes, ReservedModels } from "./constants";

let modelBuilderFunction: ModelBuilderFunction | undefined;
let actingModelRegistry: BuilderRegistry<any>;

export function isPropertyModel<M extends Model>(
  target: M,
  attribute: string
): boolean | string | undefined {
  if (isModel((target as Record<string, any>)[attribute])) return true;
  const metadata = Reflect.getMetadata(ModelKeys.TYPE, target, attribute);
  return Model.get(metadata.name) ? metadata.name : undefined;
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
  try {
    return target instanceof Model || !!Model.getMetadata(target as any);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: any) {
    return false;
  }
}

/**
 * @summary ModelRegistry Interface
 *
 * @interface ModelRegistry
 * @extends BuilderRegistry<Model>
 *
 * @category Model
 */
export type ModelRegistry<T extends Model> = BuilderRegistry<T>;

/**
 * @summary Util class to enable serialization and correct rebuilding
 *
 * @param {string} anchorKey defaults to {@link ModelKeys.ANCHOR}. The property name where the registered class name is stored;
 * @param {function(Record<string, any>): boolean} [testFunction] method to test if the provided object is a Model Object. defaults to {@link isModel}
 *
 * @class ModelRegistryManager
 * @implements ModelRegistry
 *
 * @category Model
 */
export class ModelRegistryManager<T extends Model> implements ModelRegistry<T> {
  private cache: Record<string, ModelConstructor<T>> = {};
  private readonly testFunction: (obj: object) => boolean;

  constructor(testFunction: (obj: Record<string, any>) => boolean = isModel) {
    this.testFunction = testFunction;
  }

  /**
   * @summary register new Models
   * @param {any} constructor
   * @param {string} [name] when not defined, the name of the constructor will be used
   */
  register(constructor: ModelConstructor<T>, name?: string): void {
    if (typeof constructor !== "function")
      throw new Error(
        "Model registering failed. Missing Class name or constructor"
      );
    name = name || constructor.name;
    this.cache[name] = constructor;
  }

  /**
   * @summary Gets a registered Model {@link ModelConstructor}
   * @param {string} name
   */
  get(name: string): ModelConstructor<T> | undefined {
    try {
      return this.cache[name];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      return undefined;
    }
  }

  /**
   * @param {Record<string, any>} obj
   * @param {string} [clazz] when provided, it will attempt to find the matching constructor
   *
   * @throws Error If clazz is not found, or obj is not a {@link Model} meaning it has no {@link ModelKeys.ANCHOR} property
   */
  build(obj: Record<string, any> = {}, clazz?: string): T {
    if (!clazz && !this.testFunction(obj))
      throw new Error("Provided obj is not a Model object");
    const name = clazz || Model.getMetadata(obj as any);
    if (!(name in this.cache))
      throw new Error(
        sf("Provided class {0} is not a registered Model object", name)
      );
    return new this.cache[name](obj);
  }
}

/**
 * @summary Bulk Registers Models
 * @description Useful when using bundlers that might not evaluate all the code at once
 *
 * @param {Array<Constructor<T>> | Array<{name: string, constructor: Constructor<T>}>} [models]
 *
 * @memberOf module:decorator-validation.Model
 * @category Model
 */
export function bulkModelRegister<T extends Model>(
  ...models: (Constructor<T> | { name: string; constructor: Constructor<T> })[]
) {
  models.forEach(
    (m: Constructor<T> | { name: string; constructor: Constructor<T> }) => {
      const constructor: Constructor<T> = (
        m.constructor ? m.constructor : m
      ) as Constructor<T>;
      Model.register(constructor, (m as Constructor<T>).name);
    }
  );
}

/**
 * @summary Abstract class representing a Validatable Model object
 * @description Meant to be used as a base class for all Model classes
 *
 * Model objects must:
 *  - Have all their required properties marked with '!';
 *  - Have all their optional properties marked as '?':
 *
 * @param {Model | {}} model base object from which to populate properties from
 *
 * @class Model
 * @abstract
 * @implements Validatable
 * @implements Serializable
 *
 * @example
 *      class ClassName {
 *          @required()
 *          requiredPropertyName!: PropertyType;
 *
 *          optionalPropertyName?: PropertyType;
 *      }
 */
export abstract class Model
  implements Validatable, Serializable, Hashable, Comparable<Model>
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected constructor(arg?: ModelArg<Model>) {}

  /**
   * @summary Validates the object according to its decorated properties
   *
   * @param {any[]} [exceptions] properties in the object to be ignored for the validation. Marked as 'any' to allow for extension but expects strings
   */
  public hasErrors(...exceptions: any[]): ModelErrorDefinition | undefined {
    return validate(this, ...exceptions);
  }

  /**
   * @summary Compare object equality recursively
   * @param {any} obj object to compare to
   * @param {string} [exceptions] property names to be excluded from the comparison
   */
  public equals(obj: any, ...exceptions: string[]): boolean {
    return isEqual(this, obj, ...exceptions);
  }

  /**
   * @summary Returns the serialized model according to the currently defined {@link Serializer}
   */
  serialize(): string {
    return Model.serialize(this);
  }

  /**
   * @summary Override the implementation for js's 'toString()' which sucks...
   * @override
   */
  public toString(): string {
    return this.constructor.name + ": " + JSON.stringify(this, undefined, 2);
  }

  /**
   * @summary Defines a default implementation for object hash. Relies on a very basic implementation based on Java's string hash;
   */
  public hash(): string {
    return Model.hash(this);
  }

  /**
   * @summary Deserializes a Model
   * @param {string} str
   *
   * @throws {Error} If it fails to parse the string, or if it fails to build the model
   */
  static deserialize(str: string) {
    const metadata = Reflect.getMetadata(
      Model.key(ModelKeys.SERIALIZATION),
      this.constructor
    );

    if (metadata && metadata.serializer)
      return Serialization.deserialize(
        str,
        metadata.serializer,
        ...(metadata.args || [])
      );
    return Serialization.deserialize(str);
  }

  /**
   * @summary Repopulates the Object properties with the ones from the new object
   * @description Iterates all common properties of obj (if existing) and self, and copies them onto self
   *
   * @param {T} self
   * @param {T | Record<string, any>} [obj]
   *
   */
  static fromObject<T extends Model>(
    self: T,
    obj?: T | Record<string, any>
  ): T {
    if (!obj) obj = {};
    for (const prop of Model.getAttributes(self)) {
      (self as any)[prop] = (obj as any)[prop] || undefined;
    }
    return self;
  }

  /**
   * @summary Repopulates the instance with the ones from the new Model Object
   * @description Iterates all common properties of obj (if existing) and self, and copies them onto self.
   * Is aware of nested Model Objects and rebuilds them also.
   * When List properties are decorated with {@link list}, they list items will also be rebuilt
   *
   * @param {T} self
   * @param {T | Record<string, any>} [obj]
   *
   */
  static fromModel<T extends Model>(self: T, obj?: T | Record<string, any>): T {
    if (!obj) obj = {};

    let decorators: DecoratorMetadata[], dec: DecoratorMetadata;

    const props = Model.getAttributes(self);

    for (const prop of props) {
      (self as Record<string, any>)[prop] =
        (obj as Record<string, any>)[prop] ?? undefined;
      if (typeof (self as any)[prop] !== "object") continue;
      const propM = isPropertyModel(self, prop);
      if (propM) {
        try {
          (self as Record<string, any>)[prop] = Model.build(
            (self as Record<string, any>)[prop],
            typeof propM === "string" ? propM : undefined
          );
        } catch (e: any) {
          console.log(e);
        }
        continue;
      }

      const allDecorators: DecoratorMetadata[] =
        Reflection.getPropertyDecorators(
          ValidationKeys.REFLECT,
          self,
          prop
        ).decorators;
      decorators = allDecorators.filter(
        (d: DecoratorMetadata) =>
          [ModelKeys.TYPE, ValidationKeys.TYPE as string].indexOf(d.key) !== -1
      );
      if (!decorators || !decorators.length)
        throw new Error(sf("failed to find decorators for property {0}", prop));
      dec = decorators.pop() as DecoratorMetadata;
      const clazz = dec.props.name
        ? [dec.props.name]
        : Array.isArray(dec.props.customTypes)
          ? dec.props.customTypes
          : [dec.props.customTypes];
      const reserved = Object.values(ReservedModels).map((v) =>
        v.toLowerCase()
      ) as string[];

      clazz.forEach((c) => {
        if (reserved.indexOf(c.toLowerCase()) === -1)
          try {
            switch (c) {
              case "Array":
              case "Set":
                if (allDecorators.length) {
                  const listDec = allDecorators.find(
                    (d) => d.key === ValidationKeys.LIST
                  );
                  if (listDec) {
                    const clazzName = (listDec.props.clazz as string[]).find(
                      (t: string) => !jsTypes.includes(t.toLowerCase())
                    );
                    if (c === "Array")
                      (self as Record<string, any>)[prop] = (
                        self as Record<string, any>
                      )[prop].map((el: any) => {
                        return ["object", "function"].includes(typeof el) &&
                          clazzName
                          ? Model.build(el, clazzName)
                          : el;
                      });
                    if (c === "Set") {
                      const s = new Set();
                      for (const v of (self as Record<string, any>)[prop]) {
                        if (
                          ["object", "function"].includes(typeof v) &&
                          clazzName
                        ) {
                          s.add(Model.build(v, clazzName));
                        } else {
                          s.add(v);
                        }
                      }
                      (self as Record<string, any>)[prop] = s;
                    }
                  }
                }
                break;
              default:
                if ((self as Record<string, any>)[prop])
                  (self as Record<string, any>)[prop] = Model.build(
                    (self as any)[prop],
                    c
                  );
            }
          } catch (e: any) {
            console.log(e);
            // do nothing. we have no registry of this class
          }
      });
    }
    return self;
  }

  /**
   * @summary Sets the Global {@link ModelBuilderFunction}
   * @param {ModelBuilderFunction} [builder]
   */
  static setBuilder(builder?: ModelBuilderFunction) {
    modelBuilderFunction = builder;
  }

  /**
   * @summary Retrieves the current global {@link ModelBuilderFunction}
   */
  static getBuilder(): ModelBuilderFunction | undefined {
    return modelBuilderFunction;
  }

  /**
   * Returns the current {@link ModelRegistryManager}
   *
   * @return ModelRegistry, defaults to {@link ModelRegistryManager}
   */
  private static getRegistry() {
    if (!actingModelRegistry) actingModelRegistry = new ModelRegistryManager();
    return actingModelRegistry;
  }

  /**
   * Returns the current actingModelRegistry
   *
   * @param {BuilderRegistry} modelRegistry the new implementation of Registry
   */
  static setRegistry(modelRegistry: BuilderRegistry<any>) {
    actingModelRegistry = modelRegistry;
  }

  /**
   * @summary register new Models
   * @param {any} constructor
   * @param {string} [name] when not defined, the name of the constructor will be used
   *
   * @see ModelRegistry
   */
  static register<T extends Model>(
    constructor: ModelConstructor<T>,
    name?: string
  ): void {
    return Model.getRegistry().register(constructor, name);
  }

  /**
   * @summary Gets a registered Model {@link ModelConstructor}
   * @param {string} name
   *
   * @see ModelRegistry
   */
  static get<T extends Model>(name: string): ModelConstructor<T> | undefined {
    return Model.getRegistry().get(name);
  }

  /**
   * @param {Record<string, any>} obj
   * @param {string} [clazz] when provided, it will attempt to find the matching constructor
   *
   * @throws Error If clazz is not found, or obj is not a {@link Model} meaning it has no {@link ModelKeys.ANCHOR} property
   *
   * @see ModelRegistry
   */
  static build<T extends Model>(
    obj: Record<string, any> = {},
    clazz?: string
  ): T {
    return Model.getRegistry().build(obj, clazz);
  }

  static getMetadata<V extends Model>(model: V) {
    const metadata = Reflect.getMetadata(
      Model.key(ModelKeys.MODEL),
      model.constructor
    );
    if (!metadata)
      throw new Error(
        "could not find metadata for provided " + model.constructor.name
      );
    return metadata;
  }

  static getAttributes<V extends Model>(model: Constructor<V> | V) {
    const result: string[] = [];
    let prototype =
      model instanceof Model
        ? Object.getPrototypeOf(model)
        : (model as any).prototype;
    while (prototype != null) {
      const props: string[] = prototype[ModelKeys.ATTRIBUTE];
      if (props) {
        result.push(...props);
      }
      prototype = Object.getPrototypeOf(prototype);
    }
    return result;
  }

  static equals<V extends Model>(obj1: V, obj2: V, ...exceptions: any[]) {
    return isEqual(obj1, obj2, ...exceptions);
  }

  static hasErrors<V extends Model>(model: V, ...propsToIgnore: string[]) {
    return validate(model, ...propsToIgnore);
  }

  static serialize<V extends Model>(model: V) {
    const metadata = Reflect.getMetadata(
      Model.key(ModelKeys.SERIALIZATION),
      model.constructor
    );

    if (metadata && metadata.serializer)
      return Serialization.serialize(
        this,
        metadata.serializer,
        ...(metadata.args || [])
      );
    return Serialization.serialize(model);
  }

  static hash<V extends Model>(model: V) {
    const metadata = Reflect.getMetadata(
      Model.key(ModelKeys.HASHING),
      model.constructor
    );

    if (metadata && metadata.algorithm)
      return Hashing.hash(model, metadata.algorithm, ...(metadata.args || []));
    return Hashing.hash(model);
  }
  /**
   * @summary Builds the key to store as Metadata under Reflections
   * @description concatenates {@link ModelKeys#REFLECT} with the provided key
   * @param {string} str
   */
  static key(str: string) {
    return ModelKeys.REFLECT + str;
  }
}
