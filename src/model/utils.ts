import { ModelKeys } from "../utils/constants";
import { getClassDecorators } from "@decaf-ts/reflection";

/**
 * @summary For Serialization/deserialization purposes.
 * @description Reads the {@link ModelKeys.ANCHOR} property of a {@link Model} to discover the class to instantiate
 *
 * @function isModel
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function isModel(target: Record<string, any>) {
  return (
    !!target[ModelKeys.ANCHOR] ||
    !!getClassDecorators(ModelKeys.REFLECT, target).find(
      (dec) => dec.key === ModelKeys.MODEL && dec.props && dec.props.class,
    )
  );
}
