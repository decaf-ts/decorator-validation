import { HashingFunction } from "./hashing";
import { metadata } from "@decaf-ts/reflection";
import { getModelKey } from "../model/decorators";
import { ModelKeys } from "./constants";
import { Constructor } from "../model/types";
import { Serializer } from "./serialization";

export function hashedBy(func: HashingFunction, ...args: any[]) {
  return metadata(getModelKey(ModelKeys.HASHING), {
    func: func,
    args: args,
  });
}

export function serializedBy(
  serializer: Constructor<Serializer<any>>,
  ...args: any[]
) {
  return metadata(getModelKey(ModelKeys.HASHING), {
    serializer: serializer,
    args: args,
  });
}
