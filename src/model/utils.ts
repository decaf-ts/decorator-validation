import { ModelKeys } from "../utils/constants";
import type { Model } from "./Model";

export function getModelKey(str: string) {
  return ModelKeys.REFLECT + str;
}

export function getMetadata<M extends Model<true | false>>(model: M) {
  const metadata = Reflect.getMetadata(
    getModelKey(ModelKeys.MODEL),
    model.constructor
  );
  if (!metadata)
    throw new Error(
      "could not find metadata for provided " + model.constructor.name
    );
  return metadata;
}
