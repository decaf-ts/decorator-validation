import "./Metadata";
import { Metadata, Constructor } from "@decaf-ts/decoration";
import { Model } from "../model/Model";
import { ExtendedMetadata } from "./types";
import { ModelKeys } from "../utils/constants";

(Metadata as any).validations = function <M extends Model>(
  this: Metadata,
  model: Constructor<M>,
  property: keyof M
): any {
  const meta = Metadata.get(model) as ExtendedMetadata<M> | undefined;
  if (!meta) return undefined;
  return meta.validations[property];
}.bind(Metadata);

(Metadata as any).metadata = function <M extends Model>(model: Constructor<M>) {
  const metadata = Metadata.get(model, ModelKeys.MODEL);
  if (!metadata)
    throw new Error(
      "could not find metadata for provided " + model.constructor.name
    );
  return metadata;
}.bind(Metadata);
