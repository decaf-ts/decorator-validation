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
import { ModelRegistryManager } from "../model/model-registry";

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
    const { designTypes } = Metadata.getPropDesignTypes(model, property);

    // Adds by default the type validation
    // If the designtypes is object, we exclude it. It causes problems with pks.
    if (
      (meta.validation as any)[property] &&
      designTypes?.length &&
      designTypes[0] !== ReservedModels.OBJECT
    )
      (meta.validation as any)[property][ValidationKeys.TYPE] = {
        customTypes: designTypes,
        message: DEFAULT_ERROR_MESSAGES.TYPE,
        description: "defines the accepted types for the attribute",
        async: false,
      };
  }

  if (!key) {
    const validationsForProp = meta.validation[property] as Record<
      string,
      ValidationMetadata
    >;
    return validationsForProp as unknown as K extends string
      ? ValidationMetadata
      : P extends keyof M
        ? Record<string, ValidationMetadata>
        : Record<keyof M, Record<string, ValidationMetadata>>;
  }
  const propValidation = meta.validation[property] as
    | Record<string, ValidationMetadata>
    | undefined;
  if (!propValidation) return undefined;
  return propValidation[key] as unknown as K extends string
    ? ValidationMetadata
    : P extends keyof M
      ? Record<string, ValidationMetadata>
      : Record<keyof M, Record<string, ValidationMetadata>>;
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
  // TODO: CHeck why some are not iterable
  return validation &&
    validation[ValidationKeys.TYPE] &&
    typeof validation[ValidationKeys.TYPE]?.customTypes[Symbol.iterator] ===
      "function"
    ? [...validation[ValidationKeys.TYPE].customTypes]
    : [designType];
}.bind(Metadata);

(Metadata as any).getPropDesignTypes = function <M extends Model>(
  model: Constructor<M>,
  prop: keyof M
) {
  const metadata = Metadata.get(model) as ExtendedMetadata<M> | undefined;
  const designTypeMeta = Metadata.type(model, prop as any);
  const validation = metadata?.[ValidationKeys.REFLECT]?.[prop] as
    | Record<string, any>
    | undefined;

  if (!designTypeMeta && (!validation || !validation[ValidationKeys.TYPE]))
    return {};

  const propTypes: any[] | undefined =
    validation && validation[ValidationKeys.TYPE]
      ? [validation[ValidationKeys.TYPE].customTypes]
      : [designTypeMeta];

  if (!propTypes?.length) return {};

  const designTypeDec = propTypes[0];
  const designType =
    designTypeDec.class ||
    designTypeDec.clazz ||
    designTypeDec.customTypes ||
    designTypeDec;

  const designTypes = (
    Array.isArray(designType) ? designType : [designType]
  ).map(
    (e: any) => (e = typeof e === "function" && !e.name ? e() : e)
  ) as Constructor[];

  return { designTypes, designType };
}.bind(Metadata);

(Metadata as any).isModel = function isModel(
  target: Record<string, any>
): boolean {
  try {
    if (target instanceof Model) return true;
    const constr = Metadata.constr(target as any);
    if (!constr || constr === target) return false;
    return !!Metadata.modelName(constr as any);
    //
    // // return target instanceof Model || !!Metadata.modelName(target as any);
    // const modelName = Metadata.modelName(target as any);
    // return target instanceof Model || !!Model.get(modelName);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e: any) {
    return false;
  }
}.bind(Metadata);

(Metadata as any).isPropertyModel = function isPropertyModel<M extends Model>(
  target: M,
  attribute: string
): boolean | string | undefined {
  const isModel = Metadata.isModel((target as Record<string, any>)[attribute]);
  if (isModel) return true;
  const metadata = Metadata.type(
    target.constructor as Constructor<M>,
    attribute as string
  );
  if (!metadata) return undefined;
  return ModelRegistryManager.getRegistry().get(metadata.name)
    ? metadata.name
    : undefined;
}.bind(Metadata);

(Metadata as any).getAttributes = function getAttributes<V extends Model>(
  model: Constructor<V> | V
): string[] {
  const constructor =
    model instanceof Model ? (model.constructor as Constructor) : model;
  const seen = new Set<string>();

  const collect = (current?: Constructor): string[] => {
    if (!current) return [];

    const parent = Object.getPrototypeOf(current) as Constructor | undefined;
    const attributes = collect(parent);
    const props = Metadata.properties(current) ?? [];

    for (const prop of props) {
      if (!seen.has(prop)) {
        seen.add(prop);
        attributes.push(prop);
      }
    }

    return attributes;
  };

  return collect(constructor);
}.bind(Metadata);
