import { Model } from "./Model";
import { BuilderRegistry } from "../utils/registry";
import { Constructor, ModelConstructor } from "./types";
import { sf } from "../utils/strings";
import { isModel } from "./utils";
import { ModelKeys } from "../utils";

/**
 * @summary ModelRegistry Interface
 *
 * @interface ModelRegistry
 * @extends BuilderRegistry<Model>
 *
 * @category Model
 */
export interface ModelRegistry<T extends Model> extends BuilderRegistry<T> {}

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
        `Model registering failed. Missing Class name or constructor`,
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
    } catch (e) {
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
      throw new Error(`Provided obj is not a Model object`);
    const name = clazz || Model.getMetadata(obj as any);
    if (!(name in this.cache))
      throw new Error(
        sf(`Provided class {0} is not a registered Model object`, name),
      );
    return new this.cache[name](obj);
  }
}

/**
 * @summary Bulk Registers Models
 * @description Useful when using bundlers that might not evaluate all of the code at once
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
    },
  );
}
