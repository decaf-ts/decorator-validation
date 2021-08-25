import Model from "./Model";
import {isModel} from "../utils";
import ModelKeys from "./constants";

/**
 * Util class to enable serialization and correct rebuilding
 * @param {string} anchorKey defaults to {@link ModelKeys.ANCHOR}. The property name where the registered class name is stored;
 * @param {function(obj: {}): boolean} testFunction method to test if the provided object is a Model Object. defaults to {@link isModel}
 */
export class ModelRegistryManager {
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

  build<T extends Model>(obj: {[indexer: string]: any} = {}): T {
      if (!this.testFunction(obj))
          throw new Error(`Provided obj is not a Model object`);
      const name = obj[this.anchorKey].class;
      return new this.cache[name](obj);
  }
}

const ModelRegistry = new ModelRegistryManager();

export default ModelRegistry;