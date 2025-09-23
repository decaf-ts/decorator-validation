import { Metadata } from "@decaf-ts/decoration";
import { Constructor, Model } from "../model/index";

(Metadata as any).validations = function <M extends Model>(
  this: Metadata,
  model: Constructor<M>,
  property: string
): any {
  const meta = this.get(model);
  if (!meta) return undefined;
  return meta.validations[property];
}.bind(Metadata);
