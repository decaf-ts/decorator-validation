import { metadata } from "@decaf-ts/reflection";
import { ModelKeys } from "./constants";
import { getModelKey } from "../model/utils";

export function hashedBy(algorithm: string, ...args: any[]) {
  return metadata(getModelKey(ModelKeys.HASHING), {
    algorithm: algorithm,
    args: args,
  }) as any;
}

export function serializedBy(serializer: string, ...args: any[]) {
  return metadata(getModelKey(ModelKeys.SERIALIZATION), {
    serializer: serializer,
    args: args,
  }) as any;
}
