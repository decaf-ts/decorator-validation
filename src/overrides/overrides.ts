import "./Metadata";
import { Metadata, Constructor } from "@decaf-ts/decoration";
import { Model } from "../model/Model";
import { ExtendedMetadata } from "./types";
import { ValidationMetadata } from "../validation/types";
import {
  DEFAULT_ERROR_MESSAGES,
  ValidationKeys,
} from "../validation/Validators/constants";
import { ReservedModels } from "../model/constants";

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

  if (!(meta.validation as ValidationMetadata)[ValidationKeys.TYPE]) {
    const { designTypes } = Metadata.getPropDesignTypes(
      model,
      property,
      meta.validation[property] as ValidationMetadata
    );

    // Adds by default the type validation
    // If the designtypes is object, we exclude it. It causes problems with pks.
    if (
      (meta.validation as any)[property] &&
      designTypes?.length &&
      designTypes[0].toLowerCase() !== ReservedModels.OBJECT
    )
      (meta.validation as any)[property][ValidationKeys.TYPE] = {
        customTypes: designTypes,
        message: DEFAULT_ERROR_MESSAGES.TYPE,
        description: "defines the accepted types for the attribute",
        async: false,
      };
  }

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

  return validation && validation[ValidationKeys.TYPE]
    ? [validation[ValidationKeys.TYPE]]
    : [designType];
}.bind(Metadata);

(Metadata as any).getPropDesignTypes = function <M extends Model>(
  model: Constructor<M>,
  prop: keyof M,
  validation?: ValidationMetadata
) {
  const designTypeMeta = Metadata.type(model, prop as any);
  if (!validation)
    validation = Metadata.get(model as any, prop as any)?.validation;
  if (!designTypeMeta && (!validation || !validation[ValidationKeys.TYPE]))
    return {};

  const propTypes: any[] | undefined =
    validation && validation[ValidationKeys.TYPE]
      ? [validation[ValidationKeys.TYPE]]
      : [designTypeMeta];

  if (!propTypes?.length) return {};

  const designTypeDec = propTypes[0];
  const designType: any =
    designTypeDec.class ||
    designTypeDec.clazz ||
    designTypeDec.customTypes ||
    designTypeDec.name;

  const designTypes = (
    Array.isArray(designType) ? designType : [designType]
  ).map((e: any) => {
    e = typeof e === "function" && !e.name ? e() : e;
    return (e as any).name ? (e as any).name : e;
  }) as string[];

  return { designTypes, designType };
}.bind(Metadata);

/**
 * @description Persistence-related constant keys
 * @summary Enum containing string constants used throughout the persistence layer for metadata, relations, and other persistence-related operations
 * @enum {string}
 * @readonly
 * @memberOf module:core
 */
export enum PersistenceKeys {
  /** @description Key for relations metadata storage */
  RELATIONS = "__relations",

  /** @description Key for relations metadata storage */
  RELATION = "relation",
}

// TODO: Pending refine
(Metadata as any).propIsNonPopulatedRelation = function <M extends Model>(
  model: Constructor<M>,
  property: keyof M,
  relationClassName: string
): boolean | undefined {
  const metadata: any = Metadata.get(
    model instanceof Model ? model.constructor : (model as any)
  );
  if (!metadata) return;
  const relations = metadata[PersistenceKeys.RELATIONS];
  const relation = metadata[PersistenceKeys.RELATION];
  if (Array.isArray(relations) && relations?.includes(property)) {
    const relationName = Object.keys(relation)[0];

    return (
      relation[relationName]?.class === relationClassName &&
      relation[relationName]?.populate === false
    );
  }
}.bind(Metadata);
