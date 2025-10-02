import "./Metadata";
import { Metadata, Constructor, DecorationKeys } from "@decaf-ts/decoration";
import { Model } from "../model/Model";
import { ExtendedMetadata } from "./types";
import { ModelKeys } from "../utils/index";
import { set, ValidationMetadata } from "../validation/index";
import { ValidationKeys } from "../validation/Validators/constants";
import { model } from "../model/index";

(Metadata as any).validationFor = function <
  M extends Model,
  P extends keyof M = keyof M,
  K extends string = string,
>(
  this: Metadata,
  model: Constructor<M>,
  property?: keyof M,
  key?: string
):
  | (K extends string
      ? ValidationMetadata
      : P extends keyof M
        ? Record<string, ValidationMetadata>
        : Record<keyof M, Record<string, ValidationMetadata>>)
  | undefined {
  const meta = Metadata.get(model) as ExtendedMetadata<M> | undefined;
  if (!meta) return undefined;
  if (!property)
    return meta.validation as K extends string
      ? ValidationMetadata
      : P extends keyof M
        ? Record<string, ValidationMetadata>
        : Record<keyof M, Record<string, ValidationMetadata>>;
  if (!key)
    return meta.validation[property] as K extends string
      ? ValidationMetadata
      : P extends keyof M
        ? Record<string, ValidationMetadata>
        : Record<keyof M, Record<string, ValidationMetadata>>;
  if (!meta.validation[property]) return undefined;
  return meta.validation[property][key];
}.bind(Metadata);

(Metadata as any).metadata = function <M extends Model>(
  model: Constructor<M>
): ExtendedMetadata<M> {
  const metadata = Metadata.get(model, ModelKeys.MODEL) as any;
  if (!metadata)
    throw new Error(
      "could not find metadata for provided " + model.constructor.name
    );
  return metadata;
}.bind(Metadata);

(Metadata as any).validatableProperties = function <M extends Model>(
  model: Constructor<M>,
  ...propsToIgnore: string[]
) {
  const meta = Metadata.validationFor(model);
  if (!meta) return [];
  return Object.keys(meta).filter((k) => !propsToIgnore.includes(k));
}.bind(Metadata);

(Metadata as any).constructor = function <M>(model: Constructor<M>) {
  return Metadata.get(model, ModelKeys.CONSTRUCTOR) as Constructor<M>;
}.bind(Metadata);

const originalGet = Metadata.get;
(Metadata as any).get = function <
  M,
  META extends ExtendedMetadata<M> = ExtendedMetadata<M>,
>(model: Constructor, key?: string): META | undefined {
  model = model[ModelKeys.ANCHOR as keyof typeof model] || model;
  return originalGet.call(Metadata, model, key as string) as any;
};

const originalSet = Metadata.set;
(Metadata as any).set = function (
  model: Constructor | string,
  key: string,
  value: any
) {
  model = model[ModelKeys.ANCHOR as keyof typeof model] || model;
  originalSet.call(Metadata, model, key as string, value);
};

(Metadata as any).allowedTypes = function <M extends Model>(
  model: Constructor<M>,
  property?: keyof M
) {
  const designType = Metadata.type(model, property as any);
  if (!designType)
    throw new Error(`No metadata found for property ${String(property)}`);

  const validation: any = Metadata.validationFor(
    model as Constructor,
    property
  );

  if (!validation) return;
  return validation[ValidationKeys.TYPE]
    ? [validation[ValidationKeys.TYPE], designType]
    : [designType];
}.bind(Metadata);
