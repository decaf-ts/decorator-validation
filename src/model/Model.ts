import { Serialization } from "../utils/serialization";
import { BuilderRegistry } from "../utils/registry";
import { ModelErrorDefinition } from "./ModelErrorDefinition";
import {
  Comparable,
  Hashable,
  ModelArg,
  ModelBuilderFunction,
  ModelConstructor,
  Serializable,
  Validatable,
} from "./types";
import { validate } from "./validation";
import { Hashing } from "../utils/hashing";
import { ModelKeys } from "../utils/constants";
import { ValidationKeys } from "../validation/Validators/constants";
import { jsTypes, ReservedModels } from "./constants";
import { getMetadata } from "./utils";

import { ConditionalAsync } from "../types";
import { ASYNC_META_KEY } from "../constants";
import { Metadata, Constructor, DecorationKeys } from "@decaf-ts/decoration";
import { isEqual } from "../utils/equality";
import { Reflection } from "@decaf-ts/reflection";
import { model } from "./decorators";
import { ListValidatorOptions } from "../validation/index";

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
export class ModelRegistryManager<M extends Model<true | false>>
  implements ModelRegistry<M>
{
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
    const name = clazz || getMetadata(obj as any);
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
export abstract class Model<Async extends boolean = false>
  implements
    Validatable<Async>,
    Serializable,
    Hashable,
    Comparable<Model<Async>>
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected constructor(arg: ModelArg<Model> | undefined = undefined) {}

  public isAsync(): boolean {
    const self = this as any;
    return !!(self[ASYNC_META_KEY] ?? self?.constructor[ASYNC_META_KEY]);
  }

  /**
   * @description Validates the model object against its defined validation rules
   * @summary Validates the object according to its decorated properties, returning any validation errors
   *
   * @param {any[]} [exceptions] - Properties in the object to be ignored for the validation. Marked as 'any' to allow for extension but expects strings
   * @return {ModelErrorDefinition | undefined} - Returns a ModelErrorDefinition object if validation errors exist, otherwise undefined
   */
  public hasErrors(
    ...exceptions: any[]
  ): ConditionalAsync<Async, ModelErrorDefinition | undefined> {
    return validate<any, Async>(
      this,
      this.isAsync() as any,
      ...exceptions
    ) as any;
  }

  /**
   * @description Determines if this model is equal to another object
   * @summary Compare object equality recursively, checking all properties unless excluded
   *
   * @param {any} obj - Object to compare to
   * @param {string[]} [exceptions] - Property names to be excluded from the comparison
   * @return {boolean} - True if objects are equal, false otherwise
   */
  public equals(obj: any, ...exceptions: string[]): boolean {
    return isEqual(this, obj, ...exceptions);
  }

  /**
   * @description Converts the model to a serialized string representation
   * @summary Returns the serialized model according to the currently defined {@link Serializer}
   *
   * @return {string} - The serialized string representation of the model
   */
  serialize(): string {
    return Model.serialize(this);
  }

  /**
   * @description Provides a human-readable string representation of the model
   * @summary Override the implementation for js's 'toString()' to provide a more useful representation
   *
   * @return {string} - A string representation of the model including its class name and JSON representation
   * @override
   */
  public toString(): string {
    return this.constructor.name + ": " + JSON.stringify(this, undefined, 2);
  }

  /**
   * @description Generates a hash string for the model object
   * @summary Defines a default implementation for object hash, relying on a basic implementation based on Java's string hash
   *
   * @return {string} - A hash string representing the model
   */
  public hash(): string {
    return Model.hash(this);
  }

  /**
   * @description Converts a serialized string back into a model instance
   * @summary Deserializes a Model from its string representation
   *
   * @param {string} str - The serialized string to convert back to a model
   * @return {any} - The deserialized model instance
   * @throws {Error} If it fails to parse the string, or if it fails to build the model
   */
  static deserialize(str: string) {
    const metadata = Metadata.get(
      this.constructor as unknown as Constructor,
      ModelKeys.SERIALIZATION
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
   * @description Copies properties from a source object to a model instance
   * @summary Repopulates the Object properties with the ones from the new object
   *
   * @template T
   * @param {T} self - The target model instance to update
   * @param {T | Record<string, any>} [obj] - The source object containing properties to copy
   * @return {T} - The updated model instance
   */
  static fromObject<T extends Model<any>>(
    self: T,
    obj?: T | Record<string, any>
  ): T {
    if (!obj) obj = {};
    for (const prop of Model.getAttributes(self)) {
      (self as any)[prop] =
        (obj as any)[prop] ?? (self as any)[prop] ?? undefined;
    }
    return self;
  }

  /**
   * @description Copies and rebuilds properties from a source object to a model instance, handling nested models
   * @summary Repopulates the instance with properties from the new Model Object, recursively rebuilding nested models
   *
   * @template T
   * @param {T} self - The target model instance to update
   * @param {T | Record<string, any>} [obj] - The source object containing properties to copy
   * @return {T} - The updated model instance with rebuilt nested models
   *
   * @mermaid
   * sequenceDiagram
   *   participant C as Client
   *   participant M as Model.fromModel
   *   participant B as Model.build
   *   participant R as Reflection
   *
   *   C->>M: fromModel(self, obj)
   *   M->>M: Get attributes from self
   *   loop For each property
   *     M->>M: Copy property from obj to self
   *     alt Property is a model
   *       M->>M: Check if property is a model
   *       M->>B: build(property, modelType)
   *       B-->>M: Return built model
   *     else Property is a complex type
   *       M->>R: Get property decorators
   *       R-->>M: Return decorators
   *       M->>M: Filter type decorators
   *       alt Property is Array/Set with list decorator
   *         M->>M: Process each item in collection
   *         loop For each item
   *           M->>B: build(item, itemModelType)
   *           B-->>M: Return built model
   *         end
   *       else Property is another model type
   *         M->>B: build(property, propertyType)
   *         B-->>M: Return built model
   *       end
   *     end
   *   end
   *   M-->>C: Return updated self
   */
  static fromModel<T extends Model>(self: T, obj?: T | Record<string, any>): T {
    if (!obj) obj = {};

    let decorators: DecoratorMetadata[], dec: DecoratorMetadata;
    const props = Model.getAttributes(self);

    const proto = Object.getPrototypeOf(self);
    let descriptor: PropertyDescriptor | undefined;
    for (const prop of props) {
      try {
        (self as Record<string, any>)[prop] =
          (obj as Record<string, any>)[prop] ??
          (self as Record<string, any>)[prop] ??
          undefined;
      } catch (e: unknown) {
        descriptor = Object.getOwnPropertyDescriptor(proto, prop);
        if (!descriptor || descriptor.writable)
          throw new Error(`Unable to write property ${prop} to model: ${e}`);
      }

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

      // const metadata: any = Metadata.get(self.constructor as Constructor);
      const validationMetadata = Metadata.validationFor(
        self.constructor as Constructor,
        prop
      );

      const designType = Metadata.designTypeOf(
        self.constructor as any,
        prop as any
      );
      if (!designType)
        throw new Error(`No metadata found for property ${prop}`);

      const validation = Metadata.validationFor(
        self.constructor as Constructor,
        prop
      );
      decorators = validation[ValidationKeys.TYPE]
        ? [validation[ValidationKeys.TYPE], designType]
        : [designType];

      if (!decorators || !decorators.length)
        throw new Error(`failed to find decorators for property ${prop}`);
      dec = decorators[0] as DecoratorMetadata;
      const clazz = dec?.name
        ? [dec?.name]
        : (Array.isArray(dec?.customTypes)
            ? dec.customTypes
            : [dec?.customTypes]
          ).map((t) => (typeof t === "function" && !t.name ? t() : t));

      const reserved = Object.values(ReservedModels).map((v) =>
        v.toLowerCase()
      ) as string[];

      //TODO: check and refactor after this point
      clazz.forEach((c: any) => {
        if (typeof c === "function") {
          if (c.name) c = c.name;
          else c = c();
        }
        if (reserved.indexOf(c?.toLowerCase()) === -1)
          try {
            switch (c) {
              case "Array":
              case "Set": {
                const listDec: ListValidatorOptions =
                  validation[ValidationKeys.LIST];
                if (!listDec) break;
                let clazzName = (listDec.clazz as string[]).find(
                  (t: string) => {
                    t = typeof t === "function" ? (t as any)() : t;
                    t = (t as any).name ? (t as any).name : t;
                    return !jsTypes.includes(t);
                  }
                );
                clazzName =
                  typeof clazzName === "string"
                    ? clazzName
                    : (clazzName as any)();
                clazzName =
                  typeof clazzName === "string"
                    ? clazzName
                    : (clazzName as any).name;
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
                break;
              }
              default:
                if (
                  typeof self[prop as keyof typeof self] !== "undefined" &&
                  Model.get(c)
                )
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
   * @description Configures the global model builder function
   * @summary Sets the Global {@link ModelBuilderFunction} used for building model instances
   *
   * @param {ModelBuilderFunction} [builder] - The builder function to set as the global builder
   * @return {void}
   */
  static setBuilder(builder?: ModelBuilderFunction) {
    modelBuilderFunction = builder;
  }

  /**
   * @description Retrieves the currently configured global model builder function
   * @summary Returns the current global {@link ModelBuilderFunction} used for building model instances
   *
   * @return {ModelBuilderFunction | undefined} - The current global builder function or undefined if not set
   */
  static getBuilder(): ModelBuilderFunction | undefined {
    return modelBuilderFunction || Model.fromModel;
  }

  /**
   * @description Provides access to the current model registry
   * @summary Returns the current {@link ModelRegistryManager} instance, creating one if it doesn't exist
   *
   * @return {ModelRegistry<any>} - The current model registry, defaults to a new {@link ModelRegistryManager} if not set
   * @private
   */
  private static getRegistry() {
    if (!actingModelRegistry) actingModelRegistry = new ModelRegistryManager();
    return actingModelRegistry;
  }

  /**
   * @description Configures the model registry to be used by the Model system
   * @summary Sets the current model registry to a custom implementation
   *
   * @param {BuilderRegistry<any>} modelRegistry - The new implementation of Registry to use
   * @return {void}
   */
  static setRegistry(modelRegistry: BuilderRegistry<any>) {
    actingModelRegistry = modelRegistry;
  }

  /**
   * @description Registers a model constructor with the model registry
   * @summary Registers new model classes to make them available for serialization and deserialization
   *
   * @template T
   * @param {ModelConstructor<T>} constructor - The model constructor to register
   * @param {string} [name] - Optional name to register the constructor under, defaults to constructor.name
   * @return {void}
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
   * @description Retrieves a registered model constructor by name
   * @summary Gets a registered Model {@link ModelConstructor} from the model registry
   *
   * @template T
   * @param {string} name - The name of the model constructor to retrieve
   * @return {ModelConstructor<T> | undefined} - The model constructor if found, undefined otherwise
   *
   * @see ModelRegistry
   */
  static get<T extends Model>(name: string): ModelConstructor<T> | undefined {
    return Model.getRegistry().get(name);
  }

  /**
   * @description Creates a model instance from a plain object
   * @summary Builds a model instance using the model registry, optionally specifying the model class
   *
   * @template T
   * @param {Record<string, any>} obj - The source object to build the model from
   * @param {string} [clazz] - When provided, it will attempt to find the matching constructor by name
   * @return {T} - The built model instance
   * @throws {Error} If clazz is not found, or obj is not a {@link Model} meaning it has no {@link ModelKeys.ANCHOR} property
   *
   * @see ModelRegistry
   */
  static build<T extends Model>(
    obj: Record<string, any> = {},
    clazz?: string
  ): T {
    return Model.getRegistry().build(obj, clazz);
  }

  /**
   * @description Retrieves all attribute names from a model class or instance
   * @summary Gets all attributes defined in a model, traversing the prototype chain to include inherited attributes
   *
   * @template V
   * @param {Constructor<V> | V} model - The model class or instance to get attributes from
   * @return {string[]} - Array of attribute names defined in the model
   */
  static getAttributes<V extends Model>(model: Constructor<V> | V): string[] {
    return Metadata.properties(
      model instanceof Model ? (model.constructor as Constructor) : model
    ) as string[] | [];
  }

  /**
   * @description Compares two model instances for equality
   * @summary Determines if two model instances are equal by comparing their properties
   *
   * @template M
   * @param {M} obj1 - First model instance to compare
   * @param {M} obj2 - Second model instance to compare
   * @param {any[]} [exceptions] - Property names to exclude from comparison
   * @return {boolean} - True if the models are equal, false otherwise
   */
  static equals<M extends Model>(obj1: M, obj2: M, ...exceptions: any[]) {
    return isEqual(obj1, obj2, ...exceptions);
  }

  /**
   * @description Validates a model instance against its validation rules
   * @summary Checks if a model has validation errors, optionally ignoring specified properties
   *
   * @template M
   * @param {M} model - The model instance to validate
   * @param {boolean} async - A flag indicating whether validation should be asynchronous.
   * @param {string[]} [propsToIgnore] - Properties to exclude from validation
   * @return {ModelErrorDefinition | undefined} - Returns validation errors if any, otherwise undefined
   */
  static hasErrors<M extends Model, Async extends boolean = false>(
    model: M,
    async: Async,
    ...propsToIgnore: string[]
  ): ConditionalAsync<Async, ModelErrorDefinition | undefined> {
    return validate<any, Async>(model, async, ...propsToIgnore) as any;
  }

  /**
   * @description Converts a model instance to a serialized string
   * @summary Serializes a model instance using the configured serializer or the default one
   *
   * @template M
   * @param {M} model - The model instance to serialize
   * @return {string} - The serialized string representation of the model
   */
  static serialize<M extends Model<boolean>>(model: M) {
    const metadata = Metadata.get(
      model.constructor as Constructor,
      ModelKeys.SERIALIZATION
    );

    if (metadata && metadata.serializer)
      return Serialization.serialize(
        this,
        metadata.serializer,
        ...(metadata.args || [])
      );
    return Serialization.serialize(model);
  }

  /**
   * @description Generates a hash string for a model instance
   * @summary Creates a hash representation of a model using the configured algorithm or the default one
   *
   * @template M
   * @param {M} model - The model instance to hash
   * @return {string} - The hash string representing the model
   */
  static hash<M extends Model<boolean>>(model: M) {
    const metadata = Metadata.get(
      model.constructor as Constructor,
      ModelKeys.HASHING
    );

    if (metadata && metadata.algorithm)
      return Hashing.hash(model, metadata.algorithm, ...(metadata.args || []));
    return Hashing.hash(model);
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
      return target instanceof Model || !!getMetadata(target as any);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      return false;
    }
  }

  /**
   * @description Checks if a property of a model is itself a model or has a model type
   * @summary Determines whether a specific property of a model instance is either a model instance
   * or has a type that is registered as a model
   *
   * @template M
   * @param {M} target - The model instance to check
   * @param {string} attribute - The property name to check
   * @return {boolean | string | undefined} - Returns true if the property is a model instance,
   * the model name if the property has a model type, or undefined if not a model
   */
  static isPropertyModel<M extends Model>(
    target: M,
    attribute: string
  ): boolean | string | undefined {
    if (Model.isModel((target as Record<string, any>)[attribute])) return true;
    const metadata = Metadata.designTypeOf(
      target.constructor as Constructor<M>,
      attribute as keyof M
    );
    if (!metadata) return undefined;
    return Model.get(metadata.name) ? metadata.name : undefined;
  }

  static describe<M extends Model>(model: Constructor<M>, key?: keyof M) {
    return Metadata.description(model, key);
  }
}
