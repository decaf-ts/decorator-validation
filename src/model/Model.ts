import {
  DEFAULT_ERROR_MESSAGES,
  ValidationKeys,
} from "../validation/Validators/constants";
import {
  Errors,
  ModelErrors,
  ValidationDecoratorDefinition,
  ValidationPropertyDecoratorDefinition,
} from "../validation/types";
import { JSONSerializer, Serializer } from "../utils/serialization";
import { BuilderRegistry } from "../utils/registry";
import { ModelErrorDefinition } from "./ModelErrorDefinition";
import { ModelArg, ModelConstructor, Serializable, Validatable } from "./types";
import { ReservedModels } from "./constants";
import { ModelKeys } from "../utils/constants";
import {
  constructFromModel,
  constructFromObject,
  ModelBuilderFunction,
} from "./construction";
import { ModelRegistryManager } from "./Registry";
import { Validation } from "../validation/Validation";
import { HashingFunction, hashObj } from "../utils/hashing";
import { sf } from "../utils/strings";
import {
  getPropertyDecorators,
  isEqual,
  DecoratorMetadata,
} from "@decaf-ts/reflection";

/**
 * @summary Analyses the decorations of the properties and validates the obj according to them
 *
 * @typedef T extends Model
 * @prop {T} obj Model object to validate
 * @prop {string[]} [propsToIgnore] object properties to ignore in the validation
 *
 * @function validate
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function validate<T extends Model>(
  obj: T,
  ...propsToIgnore: string[]
): ModelErrorDefinition | undefined {
  const decoratedProperties: ValidationPropertyDecoratorDefinition[] = [];
  for (const prop in obj)
    if (obj.hasOwnProperty(prop) && propsToIgnore.indexOf(prop) === -1)
      decoratedProperties.push(
        getPropertyDecorators(
          ValidationKeys.REFLECT,
          obj,
          prop,
        ) as ValidationPropertyDecoratorDefinition,
      );

  const result = decoratedProperties.reduce(
    (
      accum: undefined | ModelErrors,
      decoratedProperty: ValidationPropertyDecoratorDefinition,
    ) => {
      const { prop, decorators } = decoratedProperty;

      if (!decorators || !decorators.length) return accum;

      const defaultTypeDecorator: ValidationDecoratorDefinition = decorators[0];

      // tries to find any type decorators or other decorators that already enforce type (the ones with the allowed types property defined). if so, skip the default type verification
      if (
        decorators.find((d: ValidationDecoratorDefinition) => {
          if (d.key === ValidationKeys.TYPE) return true;
          if (
            d.props.types?.find(
              (t: string) => t === defaultTypeDecorator.props.name,
            )
          )
            return true;
          return false;
        })
      )
        decorators.shift(); // remove the design:type decorator, since the type will already be checked

      let errs: { [indexer: string]: Errors } | undefined = decorators.reduce(
        (
          acc: undefined | { [indexer: string]: Errors },
          decorator: { key: string; props: object },
        ) => {
          const validator = Validation.get(decorator.key);
          if (!validator) {
            return acc;
          }

          const err: Errors = validator.hasErrors(
            obj[prop.toString()],
            ...(decorator.key === ModelKeys.TYPE
              ? [decorator.props]
              : Object.values(decorator.props)),
          );

          if (err) {
            acc = acc || {};
            acc[decorator.key] = err;
          }

          return acc;
        },
        undefined,
      );

      errs =
        errs ||
        Object.keys(obj)
          .filter((k) => !errs || !errs[k])
          .reduce((acc: Record<string, any> | undefined, prop) => {
            let err: Errors;
            // if a nested Model
            const allDecorators = getPropertyDecorators(
              ValidationKeys.REFLECT,
              obj,
              prop,
            ).decorators;
            const decorators = allDecorators.filter(
              (d) =>
                [ModelKeys.TYPE, ValidationKeys.TYPE].indexOf(d.key) !== -1,
            );
            if (!decorators || !decorators.length) return acc;
            const dec = decorators.pop() as DecoratorMetadata;
            const clazz = dec.props.name
              ? [dec.props.name]
              : Array.isArray(dec.props.customTypes)
                ? dec.props.customTypes
                : [dec.props.customTypes];
            const reserved = Object.values(ReservedModels).map((v) =>
              v.toLowerCase(),
            ) as string[];

            clazz.forEach((c: string) => {
              if (reserved.indexOf(c.toLowerCase()) === -1) {
                switch (c) {
                  case "Array":
                  case "Set":
                    if (allDecorators.length) {
                      const listDec = allDecorators.find(
                        (d) => d.key === ValidationKeys.LIST,
                      );
                      if (listDec) {
                        const e =
                          c === "Array"
                            ? (obj as Record<string, any>)[prop].find(
                                (c: Validatable) => c.hasErrors(),
                              )
                            : (obj as Record<string, any>)[prop]
                                .values()
                                .find((c: Validatable) => c.hasErrors());
                        if (e)
                          err = sf(
                            DEFAULT_ERROR_MESSAGES.LIST_INSIDE,
                            e.toString(),
                          );
                      }
                    }
                    break;
                  default:
                    try {
                      if ((obj as Record<string, any>)[prop])
                        err = (obj as Record<string, any>)[prop].hasErrors();
                    } catch (e: any) {
                      console.warn(
                        sf("Model should be validatable but its not"),
                      );
                    }
                }
              }
            });

            if (err) {
              acc = acc || {};
              acc[prop] = err;
            }
            return acc;
          }, undefined);

      if (errs) {
        accum = accum || {};
        accum[decoratedProperty.prop.toString()] = errs;
      }

      return accum;
    },
    undefined,
  );
  return result ? new ModelErrorDefinition(result) : undefined;
}

let modelBuilderFunction: ModelBuilderFunction | undefined;
let actingModelRegistry: BuilderRegistry<any>;
let serializer: Serializer<any>;
let hashingFunction: any;

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
  public toHash(): string {
    return Model.getHashingFunction()(this).toString();
  }

  /**
   * @summary Deserializes a Model
   * @param {string} str
   *
   * @throws {Error} If it fails to parse the string, or if it fails to build the model
   */
  static deserialize(str: string) {
    return Model.getSerializer().deserialize(str);
  }

  /**
   * @summary Serializes a Model
   * @param {Model} model
   */
  static serialize(model: any) {
    return Model.getSerializer().serialize(model);
  }

  static hash(obj: any): string {
    return Model.getHashingFunction()(obj);
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

  /**
   * @summary Sets the {@link Serializer}
   *
   * @param {Serializer} ser
   */
  static setSerializer(ser: Serializer<any>) {
    serializer = ser;
  }

  /**
   * @summary Retrieves the current defined {@link Serializer}
   *
   */
  private static getSerializer() {
    if (!serializer) serializer = new JSONSerializer();
    return serializer;
  }

  /**
   * @summary Sets the {@link HashingFunction}
   *
   * @param {HashingFunction} hasher
   */
  static setHashingFunction(hasher: HashingFunction) {
    hashingFunction = hasher;
  }

  /**
   * @summary Retrieves the current defined {@link HashingFunction}
   *
   */
  private static getHashingFunction() {
    if (!hashingFunction) hashingFunction = hashObj;
    return hashingFunction;
  }
}
