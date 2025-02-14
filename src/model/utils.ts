import { ModelKeys } from "../utils/constants";
import { Model } from "./Model";

export function isPropertyModel<M extends Model>(
  target: M,
  attribute: string
): boolean | string | undefined {
  if (isModel((target as Record<string, any>)[attribute])) return true;
  const metadata = Reflect.getMetadata(ModelKeys.TYPE, target, attribute);
  return Model.get(metadata.name) ? metadata.name : undefined;
}

/**
 * @summary For Serialization/deserialization purposes.
 * @description Reads the {@link ModelKeys.ANCHOR} property of a {@link Model} to discover the class to instantiate
 *
 * @function isModel
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function isModel(target: Record<string, any>) {
  try {
    return target instanceof Model || !!Model.getMetadata(target as any);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: any) {
    return false;
  }
}
