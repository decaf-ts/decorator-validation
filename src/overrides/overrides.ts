import "./Metadata";
import { Metadata } from "@decaf-ts/decoration";
import { Constructor, Model } from "../model/index";
import { ValidationMetadata } from "./types";

(Metadata as any).validations = function <M extends Model>(
  this: Metadata,
  model: Constructor<M>,
  property: string
): any {
  const meta = Metadata.get(model) as ValidationMetadata<M> | undefined;
  if (!meta) return undefined;
  return meta.validations[property];
}.bind(Metadata);
