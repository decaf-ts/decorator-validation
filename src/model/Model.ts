import { Serialization } from "../utils/serialization";
import { BuilderRegistry } from "../utils/registry";
import { ModelErrorDefinition } from "./ModelErrorDefinition";
import { ModelArg, ModelConstructor, Serializable, Validatable } from "./types";
import {
  constructFromModel,
  constructFromObject,
  ModelBuilderFunction,
} from "./construction";
import { ModelRegistryManager } from "./Registry";
import { isEqual } from "@decaf-ts/reflection";
import { validate } from "./validation";
import { Hashing } from "../utils/hashing";

let modelBuilderFunction: ModelBuilderFunction | undefined;
let actingModelRegistry: BuilderRegistry<any>;

/**
 * @summary Abstract class representing a Validatable Model object
 * @description Meant to be used as a base class for all Model classes
 *
 * Model objects must:
 *  - Have all their properties defined as optional;
 *  - Have all their properties initialized eg:
 *
 *  <pre>
 *      class ClassName {
 *          propertyName?: PropertyType = undefined;
 *      }
 *  </pre>
 *
 * @param {Model | {}} model base object from which to populate properties from
 *
 * @class Model
 * @abstract
 * @implements Validatable
 * @implements Serializable
 *
 * @category Model
 */
export abstract class Model implements Validatable, Serializable {
  [indexer: string]: any;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected constructor(model?: ModelArg<Model>) {}

  /**
   * @summary Validates the object according to its decorated properties
   *
   * @param {any[]} [exceptions] properties in the object to be ignored for he validation. Marked as 'any' to allow for extension but expects strings
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
    return Serialization.serialize(this);
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
  public toHash(): string {
    return Hashing.hash(this);
  }

  /**
   * @summary Deserializes a Model
   * @param {string} str
   *
   * @throws {Error} If it fails to parse the string, or if it fails to build the model
   */
  static deserialize(str: string) {
    return Serialization.deserialize(str);
  }

  /**
   * @summary Wrapper around {@link constructFromObject}
   * @param {T} self
   * @param {T | Record<string, any>} obj
   */
  static fromObject<T extends Model>(
    self: T,
    obj?: T | Record<string, any>,
  ): T {
    return constructFromObject<T>(self, obj);
  }

  /**
   * @summary Wrapper around {@link constructFromModel}
   * @param {T} self
   * @param {T | Record<string, any>} obj
   */
  static fromModel<T extends Model>(self: T, obj?: T | Record<string, any>): T {
    return constructFromModel<T>(self, obj);
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
    name?: string,
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
    clazz?: string,
  ): T {
    return Model.getRegistry().build(obj, clazz);
  }
}
