import Model from "./Model";
import {isModel} from "../utils/utils";
import {ModelKeys} from "./constants";
import {BuilderRegistry} from "../utils/registry";


export type ModelRegistry = BuilderRegistry<Model>;

/**
 * Util class to enable serialization and correct rebuilding
 * @param {string} anchorKey defaults to {@link ModelKeys.ANCHOR}. The property name where the registered class name is stored;
 * @param {function({}): boolean} testFunction method to test if the provided object is a Model Object. defaults to {@link isModel}
 * @class ModelRegistryManager
 * @memberOf Model
 */
export class ModelRegistryManager<T extends Model> implements ModelRegistry{
  private cache: {[indexer: string]: any} = {};
  private readonly testFunction: (obj: {}) => boolean;
  private readonly anchorKey: string;

  constructor(anchorKey: string = ModelKeys.ANCHOR, testFunction: (obj: {}) => boolean = isModel){
      this.testFunction = testFunction;
      this.anchorKey = anchorKey;
  }

  register(name: string, constructor: any): void {
      if (!name || typeof constructor !== 'function')
          throw new Error(`Model registering failed. Missing Class name or constructor`)
      this.cache[name] = constructor;
  }

  get(name: string): {new(): T} | undefined {
      try{
          return this.cache[name];
      } catch (e) {
          return undefined;
      }
  }

  build<T extends Model>(obj: {[indexer: string]: any} = {}): T {
      if (!this.testFunction(obj))
          throw new Error(`Provided obj is not a Model object`);
      const name = obj[this.anchorKey].class;
      return new this.cache[name](obj);
  }
}

let actingModelRegistry: ModelRegistry;

/**
 * Returns the current {@link ModelRegistryManager}
 * @function getModelRegistry
 * @return ModelRegistry, defaults to {@link ModelRegistryManager}
 * @memberOf model
 */
export function getModelRegistry(): ModelRegistry {
    if (!actingModelRegistry)
        actingModelRegistry = new ModelRegistryManager();
    return actingModelRegistry;
}

/**
 * Returns the current actingModelRegistry
 * @function setModelRegistry
 * @prop {ModelRegistry} operationsRegistry the new implementation of Registry
 * @memberOf operations
 */
export function setModelRegistry(operationsRegistry: ModelRegistry){
    actingModelRegistry = operationsRegistry;
}
