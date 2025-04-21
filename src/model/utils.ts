import { ModelKeys } from "../utils/constants";
import { isModel, Model } from "./Model";

export function isPropertyModel<M extends Model>(
  target: M,
  attribute: string
): boolean | string | undefined {
  if (isModel((target as Record<string, any>)[attribute])) return true;
  const metadata = Reflect.getMetadata(ModelKeys.TYPE, target, attribute);
  return Model.get(metadata.name) ? metadata.name : undefined;
}
