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
import { jsTypes, ReservedModels } from "./constants";

let modelBuilderFunction: ModelBuilderFunction | undefined;
let actingModelRegistry: BuilderRegistry<any>;

/**
 * @description Registry type for storing and retrieving model constructors
 * @summary The ModelRegistry type defines a registry for model constructors that extends
 * the BuilderRegistry interface. It provides a standardized way to register, retrieve,
 * and build model instances, enabling the model system to work with different types of models.
 *
 * @interface ModelRegistry
 * @template T Type of model that can be registered, must extend Model
 * @extends BuilderRegistry<T>
 * @memberOf module:decorator-validation
 * @category Model
 */
export type ModelRegistry<T extends Model> = BuilderRegistry<T>;

/**
 * @description Registry manager for model constructors that enables serialization and rebuilding
 * @summary The ModelRegistryManager implements the ModelRegistry interface and provides
 * functionality for registering, retrieving, and building model instances. It maintains
 * a cache of model constructors indexed by name, allowing for efficient lookup and instantiation.
 * This class is essential for the serialization and deserialization of model objects.
 *
 * @param {function(Record<string, any>): boolean} [testFunction] - Function to test if an object is a model, defaults to {@link Model#isModel}
 *
 * @class ModelRegistryManager
 * @template M Type of model that can be registered, must extend Model
 * @implements ModelRegistry<M>
 * @category Model
 *
 * @example
 * ```typescript
 * // Create a model registry
 * const registry = new ModelRegistryManager();
 *
 * // Register a model class
 * registry.register(User);
 *
 * // Retrieve a model constructor by name
 * const UserClass = registry.get("User");
 *
 * // Build a model instance from a plain object
 * const userData = { name: "John", age: 30 };
 * const user = registry.build(userData, "User");
 * ```
 *
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant R as ModelRegistryManager
 *   participant M as Model Class
 *
 *   C->>R: new ModelRegistryManager(testFunction)
 *   C->>R: register(ModelClass)
 *   R->>R: Store in cache
 *   C->>R: get("ModelName")
 *   R-->>C: ModelClass constructor
 *   C->>R: build(data, "ModelName")
 *   R->>R: Get constructor from cache
 *   R->>M: new ModelClass(data)
 *   M-->>R: Model instance
 *   R-->>C: Model instance
 */
export class ModelRegistryManager<M extends Model> implements ModelRegistry<M> {
  private cache: Record<string, ModelConstructor<M>> = {};
  private readonly testFunction: (obj: object) => boolean;

  constructor(
    testFunction: (obj: Record<string, any>) => boolean = Model.isModel
  ) {
    this.testFunction = testFunction;
  }

  /**
   * @description Registers a model constructor with the registry
   * @summary Adds a model constructor to the registry cache, making it available for
   * later retrieval and instantiation. If no name is provided, the constructor's name
   * property is used as the key in the registry.
   *
   * @param {ModelConstructor<M>} constructor - The model constructor to register
   * @param {string} [name] - Optional name to register the constructor under, defaults to constructor.name
   * @return {void}
   * @throws {Error} If the constructor is not a function
   */
  register(constructor: ModelConstructor<M>, name?: string): void {
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
  get(name: string): ModelConstructor<M> | undefined {
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
  build(obj: Record<string, any> = {}, clazz?: string): M {
    if (!clazz && !this.testFunction(obj))
      throw new Error("Provided obj is not a Model object");
    const name = clazz || Model.getMetadata(obj as any);
    if (!(name in this.cache))
      throw new Error(
        `Provided class ${name} is not a registered Model object`
      );
    return new this.cache[name](obj);
  }
}

/**
 * @summary Bulk Registers Models
 * @description Useful when using bundlers that might not evaluate all the code at once
 *
 * @template M extends Model
 * @param {Array<Constructor<M>> | Array<{name: string, constructor: Constructor<M>}>} [models]
 *
 * @memberOf module:decorator-validation
 * @category Model
 */
export function bulkModelRegister<M extends Model>(
  ...models: (Constructor<M> | { name: string; constructor: Constructor<M> })[]
) {
  models.forEach(
    (m: Constructor<M> | { name: string; constructor: Constructor<M> }) => {
      const constructor: Constructor<M> = (
        m.constructor ? m.constructor : m
      ) as Constructor<M>;
      Model.register(constructor, (m as Constructor<M>).name);
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
 * @param {ModelArg<Model>} model base object from which to populate properties from
 *
 * @class Model
 * @category Model
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
      const propM = Model.isPropertyModel(self, prop);
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
        throw new Error(`failed to find decorators for property ${prop}`);
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

  static equals<M extends Model>(obj1: M, obj2: M, ...exceptions: any[]) {
    return isEqual(obj1, obj2, ...exceptions);
  }

  static hasErrors<M extends Model>(model: M, ...propsToIgnore: string[]) {
    return validate(model, ...propsToIgnore);
  }

  static serialize<M extends Model>(model: M) {
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

  static hash<M extends Model>(model: M) {
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

  /**
   * @description Determines if an object is a model instance or has model metadata
   * @summary Checks whether a given object is either an instance of the Model class or
   * has model metadata attached to it. This function is essential for serialization and
   * deserialization processes, as it helps identify model objects that need special handling.
   * It safely handles potential errors during metadata retrieval.
   *
   * @param {Record<string, any>} target - The object to check
   * @return {boolean} True if the object is a model instance or has model metadata, false otherwise
   *
   * @example
   * ```typescript
   * // Check if an object is a model
   * const user = new User({ name: "John" });
   * const isUserModel = isModel(user); // true
   *
   * // Check a plain object
   * const plainObject = { name: "John" };
   * const isPlainObjectModel = isModel(plainObject); // false
   * ```
   */
  static isModel(target: Record<string, any>) {
    try {
      return target instanceof Model || !!Model.getMetadata(target as any);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      return false;
    }
  }

  /**
   * @description Checks if a property of a model is itself a model or has a model type
   * @summary Determines whether a specific property of a model instance is either a model instance
   * or has a type that is registered as a model. This function is used for model serialization
   * and deserialization to properly handle nested models.
   * @template M extends {@link Model}
   * @param {M} target - The model instance to check
   * @param {string} attribute - The property name to check
   * @return {boolean | string | undefined} Returns true if the property is a model instance,
   * the model name if the property has a model type, or undefined if not a model
   */
  static isPropertyModel<M extends Model>(
    target: M,
    attribute: string
  ): boolean | string | undefined {
    if (Model.isModel((target as Record<string, any>)[attribute])) return true;
    const metadata = Reflect.getMetadata(ModelKeys.TYPE, target, attribute);
    return Model.get(metadata.name) ? metadata.name : undefined;
  }
}
