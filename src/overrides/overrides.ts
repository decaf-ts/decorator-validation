import "./Metadata";
import { Metadata, Constructor } from "@decaf-ts/decoration";
import { Model } from "../model/Model";
import { ExtendedMetadata } from "./types";
import { ValidationMetadata } from "../validation/types";
import { ValidationKeys } from "../validation/Validators/constants";
import { ModelOperations } from "../model";

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
  if (!meta.validation) return undefined;
  if (!key)
    return meta.validation[property] as K extends string
      ? ValidationMetadata
      : P extends keyof M
        ? Record<string, ValidationMetadata>
        : Record<keyof M, Record<string, ValidationMetadata>>;
  if (!meta.validation[property]) return undefined;
  return meta.validation[property][key];
}.bind(Metadata);

(Metadata as any).modelName = function <M extends Model>(
  model: Constructor<M>
): Constructor<M> | undefined {
  const constr = Metadata.constr(model);
  return constr ? (constr as any).name : (model as any).name;
}.bind(Metadata);

(Metadata as any).validatableProperties = function <M extends Model>(
  model: Constructor<M>,
  ...propsToIgnore: string[]
) {
  const metavalidation = Metadata.validationFor(model);
  const keys: string[] = metavalidation ? Object.keys(metavalidation) : [];

  const props = [...new Set([...Model.getAttributes(model), ...keys])];
  return props.filter((k) => !propsToIgnore || !propsToIgnore?.includes(k));
}.bind(Metadata);

(Metadata as any).allowedTypes = function <M extends Model>(
  model: Constructor<M>,
  prop?: keyof M
) {
  const designType = Metadata.type(model, prop as any);
  if (!designType)
    throw new Error(`No metadata found for property ${String(prop)}`);

  const validation: any = Metadata.validationFor(model as Constructor, prop);

  if (!validation) return;
  return validation[ValidationKeys.TYPE]
    ? [validation[ValidationKeys.TYPE]]
    : [designType];
}.bind(Metadata);

// export enum ModelOperations {
//   OPERATIONS = "operations",
//   RELATIONS = "relations",
// }

// (Metadata as any).saveOperation = function <M extends Model>(
//   model: Constructor<M>,
//   propertyKey: string,
//   operation: string,
//   metadata: any
// ) {
//   if (!propertyKey) return;
//   Metadata.set(
//     model,
//     Metadata.key(ModelOperations.OPERATIONS, propertyKey, operation),
//     metadata
//   );
// }.bind(Metadata);

// (Metadata as any).readOperation = function <M extends Model>(
//   model: Constructor<M>,
//   propertyKey: string,
//   operation: string
// ) {
//   if (!propertyKey) return;
//   return Metadata.get(
//     model,
//     Metadata.key(ModelOperations.OPERATIONS, propertyKey, operation)
//   );
// }.bind(Metadata);
