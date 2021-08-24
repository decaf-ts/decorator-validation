import Model from "./Model";
import {isModel} from "../utils";
import {ModelKeys} from "../../lib";

/**
 * Util class to enable serialization and correct rebuilding
 */
class ModelRegistryManager {
  private cache: {[indexer: string]: any} = {};

  register(name: string, constructor: any): void {
      if (!name || !constructor)
          return console.error(`Model registering failed. Missing Class name or constructor`)
      this.cache[name] = constructor;
  }

  build<T extends Model>(obj: {[indexer: string]: any} = {}): any {
      if (!isModel(obj))
          throw new Error(`Provided obj is not a Model object`);
      const name = obj[ModelKeys.ANCHOR].class;
      return new this.cache[name](obj);
  }
}

const ModelRegistry = new ModelRegistryManager();

export default ModelRegistry;