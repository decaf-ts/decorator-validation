import "./Metadata";
import { Metadata, Constructor } from "@decaf-ts/decoration";
import { Model } from "../model/Model";
import { ExtendedMetadata } from "./types";

(Metadata as any).validationFor = function <M extends Model>(
  this: Metadata,
  model: Constructor<M>,
  property: keyof M,
  key?: string
): any {
  const meta = Metadata.get(model) as ExtendedMetadata<M> | undefined;
  if (!meta) return undefined;
  if (!key) return meta.validation[property];
  if (!meta.validation[property]) return undefined;
  return meta.validation[property][key];
}.bind(Metadata);

(Metadata as any).metadata = function <M extends Model>(
  model: Constructor<M>
): ExtendedMetadata<M> {
  const metadata = Metadata.get(model) as any;
  if (!metadata)
    throw new Error(
      "could not find metadata for provided " + model.constructor.name
    );
  return metadata;
}.bind(Metadata);

(Metadata as any).designTypeOf = function <M extends Model>(
  model: Constructor<M>,
  prop: keyof M
): Constructor | undefined {
  const metadata = Metadata.get(model);
  if (!metadata)
    throw new Error(
      "could not find metadata for provided " + model.constructor.name
    );
  return metadata.properties[prop];
}.bind(Metadata);
