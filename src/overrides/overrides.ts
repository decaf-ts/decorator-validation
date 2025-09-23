import "./Metadata";
import { Metadata, Constructor } from "@decaf-ts/decoration";
import { Model } from "../model/Model";
import { ExtendedMetadata } from "./types";

(Metadata as any).validations = function <M extends Model>(
  this: Metadata,
  model: Constructor<M>,
  property: keyof M
): any {
  const meta = Metadata.get(model) as ExtendedMetadata<M> | undefined;
  if (!meta) return undefined;
  return meta.validations[property];
}.bind(Metadata);
