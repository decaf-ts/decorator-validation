import { Constructor, Metadata } from "@decaf-ts/decoration";
import { ModelBuilderFunction, ModelConstructor } from "./types";

import { type Model } from "./Model";
import { BuilderRegistry } from "../utils/registry";
import { jsTypes, ReservedModels } from "./constants";
import { ListValidatorOptions, ValidationKeys } from "../validation/index";

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
    testFunction: (obj: Record<string, any>) => boolean = Metadata.isModel
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
    const name = clazz || Metadata.modelName(obj.constructor as any);
    if (!(name in this.cache))
      throw new Error(
        `Provided class ${name} is not a registered Model object`
      );
    return new this.cache[name](obj);
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
    return modelBuilderFunction || ModelRegistryManager.fromModel;
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

    let decorators: DecoratorMetadata[];
    const props = Metadata.getAttributes(self);

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

      const propM = Metadata.isPropertyModel(self, prop);
      if (propM) {
        try {
          (self as Record<string, any>)[prop] =
            ModelRegistryManager.getRegistry().build(
              (self as Record<string, any>)[prop],
              typeof propM === "string" ? propM : undefined
            );
        } catch (e: any) {
          console.log(e);
        }
        continue;
      }

      decorators = Metadata.allowedTypes(self.constructor as any, prop);

      if (!decorators || !decorators.length)
        throw new Error(`failed to find decorators for property ${prop}`);
      const clazz = decorators.map((t: any) =>
        typeof t === "function" && !t.name ? t() : t
      );

      const reserved: any = Object.values(ReservedModels);

      clazz.forEach((c: Constructor<any>) => {
        if (!reserved.includes(c))
          try {
            switch (c.name) {
              case "Array":
              case "Set": {
                const validation: any = Metadata.validationFor(
                  self.constructor as Constructor,
                  prop
                );
                if (!validation || !validation[ValidationKeys.LIST]) break;
                const listDec: ListValidatorOptions =
                  validation[ValidationKeys.LIST];
                const clazzName = (
                  listDec.clazz as (
                    | Constructor<any>
                    | (() => Constructor<any>)
                  )[]
                )
                  .map((t) =>
                    typeof t === "function" && !(t as any).name
                      ? (t as any)()
                      : t
                  )
                  .find((t) => !jsTypes.includes(t.name));

                if (c.name === "Array")
                  (self as Record<string, any>)[prop] = (
                    self as Record<string, any>
                  )[prop].map((el: any) => {
                    return ["object", "function"].includes(typeof el) &&
                      clazzName
                      ? ModelRegistryManager.getRegistry().build(
                          el,
                          clazzName.name
                        )
                      : el;
                  });
                if (c.name === "Set") {
                  const s = new Set();
                  for (const v of (self as Record<string, any>)[prop]) {
                    if (
                      ["object", "function"].includes(typeof v) &&
                      clazzName
                    ) {
                      s.add(
                        ModelRegistryManager.getRegistry().build(
                          v,
                          clazzName.name
                        )
                      );
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
                  ModelRegistryManager.getRegistry().get(c.name)
                )
                  (self as Record<string, any>)[prop] =
                    ModelRegistryManager.getRegistry().build(
                      (self as any)[prop],
                      c.name
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
   * @description Provides access to the current model registry
   * @summary Returns the current {@link ModelRegistryManager} instance, creating one if it doesn't exist
   *
   * @return {ModelRegistry<any>} - The current model registry, defaults to a new {@link ModelRegistryManager} if not set
   * @private
   */
  static getRegistry() {
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
      ModelRegistryManager.getRegistry().register(
        constructor,
        (m as Constructor<M>).name
      );
    }
  );
}
