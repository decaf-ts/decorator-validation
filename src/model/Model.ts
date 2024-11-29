import { Serialization } from "../utils/serialization";
import { BuilderRegistry } from "../utils/registry";
import { ModelErrorDefinition } from "./ModelErrorDefinition";
import {
  Comparable,
  Constructor,
  Hashable,
  ModelArg,
  ModelConstructor,
  Serializable,
  Validatable,
} from "./types";
import { ModelBuilderFunction } from "./construction";
import { ModelRegistryManager } from "./Registry";
import { DecoratorMetadata, Reflection, isEqual } from "@decaf-ts/reflection";
import { validate } from "./validation";
import { Hashing } from "../utils/hashing";
import { isPropertyModel } from "./utils";
import { ModelKeys } from "../utils/constants";
import { ValidationKeys } from "../validation/Validators/constants";
import { sf } from "../utils/strings";
import { jsTypes, ReservedModels } from "./constants";

let modelBuilderFunction: ModelBuilderFunction | undefined;
let actingModelRegistry: BuilderRegistry<any>;

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
   * @param args
   * @throws {Error} If it fails to parse the string, or if it fails to build the model
   */
  static deserialize(str: string) {
    const metadata = Reflect.getMetadata(
      this.key(ModelKeys.SERIALIZATION),
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
        (obj as Record<string, any>)[prop] || undefined;
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
          [ModelKeys.TYPE, ValidationKeys.TYPE].indexOf(d.key) !== -1
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
                    const clazzName = listDec.props.class.find(
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
      this.key(ModelKeys.MODEL),
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

  static hasErrors<V extends Model>(model: V, ...exceptions: any[]) {
    return validate(model, ...exceptions);
  }

  static serialize<V extends Model>(model: V) {
    const metadata = Reflect.getMetadata(
      this.key(ModelKeys.SERIALIZATION),
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
      this.key(ModelKeys.HASHING),
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
