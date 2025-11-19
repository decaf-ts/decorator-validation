import { Model } from "./Model";
import { ModelArg } from "./types";
import { ObjectAccumulator } from "typed-object-accumulator";
import { Constructor, DecorationKeys, prop } from "@decaf-ts/decoration";
import { model } from "./decorators";
import { ComparisonValidatorOptions } from "../validation/types";
import {
  date,
  diff,
  email,
  eq,
  gt,
  gte,
  list,
  lt,
  lte,
  max,
  maxlength,
  min,
  minlength,
  option,
  password,
  pattern,
  required,
  step,
  type,
  url,
} from "../validation/decorators";
import { ExtendedMetadata } from "../overrides/types";
import { ValidationKeys } from "../validation/Validators/constants";
import { Validation } from "../validation/Validation";

type BuildableModel = Model & Record<PropertyKey, any>;

export interface DecorateOption<M extends Model> {
  decorate(...decorators: PropertyDecorator[]): ModelBuilder<M>;
}

export class AttributeBuilder<M extends BuildableModel, N extends keyof M, T>
  implements DecorateOption<M>
{
  constructor(
    protected parent: ModelBuilder<M>,
    readonly attr: N,
    readonly declaredType: T
  ) {}

  private decorators: PropertyDecorator[] = [];

  decorate(...decorators: PropertyDecorator[]): ModelBuilder<M> {
    for (const decorator of decorators) {
      if (this.decorators.includes(decorator))
        throw new Error(`Decorator "${decorator}" has already been used`);
      this.decorators.push(decorator);
    }
    return this.parent;
  }

  undecorate(...decorators: PropertyDecorator[]) {
    for (const decorator of decorators) {
      const index = this.decorators.indexOf(decorator);
      if (index < 0)
        throw new Error(
          `Decorator "${decorator}" is not applied to ${this.attr as string}`
        );
      this.decorators.splice(index, 1);
    }
    return this.parent;
  }

  required(messageOrMeta?: string | Record<string, any>) {
    const meta = AttributeBuilder.asMeta(messageOrMeta);
    const message =
      typeof messageOrMeta === "string"
        ? messageOrMeta
        : AttributeBuilder.resolveMessage(meta);
    return this.decorate(required(message));
  }

  min(
    valueOrMeta: number | Date | string | Record<string, any>,
    message?: string
  ) {
    const meta = AttributeBuilder.asMeta(valueOrMeta);
    const value =
      meta?.[ValidationKeys.MIN] ??
      (meta ? undefined : (valueOrMeta as number | Date | string));
    if (value === undefined)
      throw new Error(`Missing ${ValidationKeys.MIN} for ${String(this.attr)}`);
    return this.decorate(
      min(value, AttributeBuilder.resolveMessage(meta, message))
    );
  }

  max(
    valueOrMeta: number | Date | string | Record<string, any>,
    message?: string
  ) {
    const meta = AttributeBuilder.asMeta(valueOrMeta);
    const value =
      meta?.[ValidationKeys.MAX] ??
      (meta ? undefined : (valueOrMeta as number | Date | string));
    if (value === undefined)
      throw new Error(`Missing ${ValidationKeys.MAX} for ${String(this.attr)}`);
    return this.decorate(
      max(value, AttributeBuilder.resolveMessage(meta, message))
    );
  }

  step(valueOrMeta: number | Record<string, any>, message?: string) {
    const meta = AttributeBuilder.asMeta(valueOrMeta);
    const value =
      meta?.[ValidationKeys.STEP] ??
      (meta ? undefined : (valueOrMeta as number));
    if (value === undefined)
      throw new Error(
        `Missing ${ValidationKeys.STEP} for ${String(this.attr)}`
      );
    return this.decorate(
      step(value, AttributeBuilder.resolveMessage(meta, message))
    );
  }

  minlength(valueOrMeta: number | Record<string, any>, message?: string) {
    const meta = AttributeBuilder.asMeta(valueOrMeta);
    const value =
      meta?.[ValidationKeys.MIN_LENGTH] ??
      (meta ? undefined : (valueOrMeta as number));
    if (value === undefined)
      throw new Error(
        `Missing ${ValidationKeys.MIN_LENGTH} for ${String(this.attr)}`
      );
    return this.decorate(
      minlength(value, AttributeBuilder.resolveMessage(meta, message))
    );
  }

  maxlength(valueOrMeta: number | Record<string, any>, message?: string) {
    const meta = AttributeBuilder.asMeta(valueOrMeta);
    const value =
      meta?.[ValidationKeys.MAX_LENGTH] ??
      (meta ? undefined : (valueOrMeta as number));
    if (value === undefined)
      throw new Error(
        `Missing ${ValidationKeys.MAX_LENGTH} for ${String(this.attr)}`
      );
    return this.decorate(
      maxlength(value, AttributeBuilder.resolveMessage(meta, message))
    );
  }

  pattern(
    valueOrMeta: RegExp | string | Record<string, any>,
    message?: string
  ) {
    const meta = AttributeBuilder.asMeta(valueOrMeta);
    const rawPattern =
      meta?.[ValidationKeys.PATTERN] ??
      (meta ? undefined : (valueOrMeta as RegExp | string));
    const regex = AttributeBuilder.patternFromString(rawPattern) ?? /.*/;
    return this.decorate(
      pattern(regex, AttributeBuilder.resolveMessage(meta, message))
    );
  }

  email(messageOrMeta?: string | Record<string, any>) {
    const meta = AttributeBuilder.asMeta(messageOrMeta);
    const message =
      typeof messageOrMeta === "string"
        ? messageOrMeta
        : AttributeBuilder.resolveMessage(meta);
    return this.decorate(email(message));
  }

  url(messageOrMeta?: string | Record<string, any>) {
    const meta = AttributeBuilder.asMeta(messageOrMeta);
    const message =
      typeof messageOrMeta === "string"
        ? messageOrMeta
        : AttributeBuilder.resolveMessage(meta);
    return this.decorate(url(message));
  }

  type(
    valueOrMeta:
      | Constructor
      | (() => Constructor)
      | (Constructor | (() => Constructor))[]
      | Record<string, any>,
    message?: string
  ) {
    const meta = AttributeBuilder.asMeta(valueOrMeta);
    const types =
      meta?.customTypes ?? meta?.type ?? (meta ? undefined : valueOrMeta);
    return this.decorate(
      type(types as any, AttributeBuilder.resolveMessage(meta, message))
    );
  }

  date(formatOrMeta?: string | Record<string, any>, message?: string) {
    const meta = AttributeBuilder.asMeta(formatOrMeta);
    const format =
      meta?.[ValidationKeys.FORMAT] ??
      (meta ? undefined : (formatOrMeta as string));
    return this.decorate(
      date(format, AttributeBuilder.resolveMessage(meta, message))
    );
  }

  password(
    valueOrMeta?: RegExp | string | Record<string, any>,
    message?: string
  ) {
    const meta = AttributeBuilder.asMeta(valueOrMeta);
    const rawPattern =
      meta?.[ValidationKeys.PATTERN] ??
      (meta ? undefined : (valueOrMeta as RegExp | string | undefined));
    const regex = AttributeBuilder.patternFromString(rawPattern);
    return this.decorate(
      password(regex, AttributeBuilder.resolveMessage(meta, message))
    );
  }

  list(
    clazzOrMeta:
      | Constructor
      | (() => Constructor)
      | (Constructor | (() => Constructor))[]
      | Record<string, any>,
    collection?: "Array" | "Set",
    message?: string
  ) {
    const meta = AttributeBuilder.asMeta(clazzOrMeta);
    const clazz = meta?.clazz ?? (meta ? undefined : clazzOrMeta);
    const typeOfCollection =
      (meta?.type as "Array" | "Set" | undefined) ?? collection;
    return this.decorate(
      list(
        clazz as any,
        typeOfCollection,
        AttributeBuilder.resolveMessage(meta, message)
      )
    );
  }

  set(clazzOrMeta: Constructor | Record<string, any>, message?: string) {
    if (AttributeBuilder.isMetadataPayload(clazzOrMeta))
      return this.list(clazzOrMeta);
    return this.list(clazzOrMeta, "Set", message);
  }

  enum(
    valueOrMeta: any[] | Record<any, any> | Record<string, any>,
    message?: string
  ) {
    const meta = AttributeBuilder.asMeta(valueOrMeta);
    const values =
      meta?.[ValidationKeys.ENUM] ?? (meta ? undefined : valueOrMeta);
    return this.decorate(
      option(values as any, AttributeBuilder.resolveMessage(meta, message))
    );
  }

  option(value: any[] | Record<any, any>, message?: string) {
    return this.enum(value, message);
  }

  private static isMetadataPayload(
    value: unknown
  ): value is Record<string, any> {
    if (!value) return false;
    if (value instanceof Date) return false;
    if (value instanceof RegExp) return false;
    if (Array.isArray(value)) return false;
    return typeof value === "object";
  }

  private static asMeta(value: unknown): Record<string, any> | undefined {
    return AttributeBuilder.isMetadataPayload(value)
      ? (value as Record<string, any>)
      : undefined;
  }

  private static resolveMessage(meta?: Record<string, any>, fallback?: string) {
    return meta?.message ?? fallback;
  }

  private static patternFromString(
    pattern?: string | RegExp
  ): RegExp | undefined {
    if (!pattern) return undefined;
    if (pattern instanceof RegExp) return pattern;
    const match = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
    if (match) return new RegExp(match[1], match[2]);
    return new RegExp(pattern);
  }

  private resolveComparison(
    propertyOrMeta: string | Record<string, any>,
    key: string,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    const meta = AttributeBuilder.asMeta(propertyOrMeta);
    if (meta) {
      return {
        target: meta[key],
        options: {
          label: meta.label,
          message: meta.message,
        } as Omit<ComparisonValidatorOptions, "async" | "description">,
      };
    }
    return { target: propertyOrMeta as string, options };
  }

  equals(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    const { target, options: resolvedOptions } = this.resolveComparison(
      propertyOrMeta,
      ValidationKeys.EQUALS,
      options
    );
    return this.decorate(eq(target, resolvedOptions));
  }

  eq(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    return this.equals(propertyOrMeta, options);
  }

  different(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    const { target, options: resolvedOptions } = this.resolveComparison(
      propertyOrMeta,
      ValidationKeys.DIFF,
      options
    );
    return this.decorate(diff(target, resolvedOptions));
  }

  diff(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    return this.different(propertyOrMeta, options);
  }

  lessThan(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    const { target, options: resolvedOptions } = this.resolveComparison(
      propertyOrMeta,
      ValidationKeys.LESS_THAN,
      options
    );
    return this.decorate(lt(target, resolvedOptions));
  }

  lt(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    return this.lessThan(propertyOrMeta, options);
  }

  lessThanOrEqual(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    const { target, options: resolvedOptions } = this.resolveComparison(
      propertyOrMeta,
      ValidationKeys.LESS_THAN_OR_EQUAL,
      options
    );
    return this.decorate(lte(target, resolvedOptions));
  }

  lte(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    return this.lessThanOrEqual(propertyOrMeta, options);
  }

  greaterThan(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    const { target, options: resolvedOptions } = this.resolveComparison(
      propertyOrMeta,
      ValidationKeys.GREATER_THAN,
      options
    );
    return this.decorate(gt(target, resolvedOptions));
  }

  gt(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    return this.greaterThan(propertyOrMeta, options);
  }

  greaterThanOrEqual(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    const { target, options: resolvedOptions } = this.resolveComparison(
      propertyOrMeta,
      ValidationKeys.GREATER_THAN_OR_EQUAL,
      options
    );
    return this.decorate(gte(target, resolvedOptions));
  }

  gte(
    propertyOrMeta: string | Record<string, any>,
    options?: Omit<ComparisonValidatorOptions, "async" | "description">
  ) {
    return this.greaterThanOrEqual(propertyOrMeta, options);
  }

  /**
   * Applies the attribute metadata and decorators to the provided constructor.
   */
  build(constructor: Constructor<M>): void {
    const target = constructor.prototype;
    const propKey = this.attr as string | symbol;

    if (!Object.getOwnPropertyDescriptor(target, propKey)) {
      Object.defineProperty(target, propKey, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: undefined,
      });
    }

    if (this.declaredType) {
      Reflect.defineMetadata(
        DecorationKeys.DESIGN_TYPE,
        this.declaredType,
        target,
        propKey
      );
    }

    prop()(target, propKey as any);

    this.decorators.forEach((decorator) => {
      try {
        decorator(target, propKey as any);
      } catch (e: unknown) {
        throw new Error(
          `Failed to apply decorator to property "${this.attr as any}": ${e}`
        );
      }
    });
  }
}

class ListAttributeBuilder<M extends BuildableModel, N extends keyof M> {
  constructor(
    private readonly parent: ModelBuilder<M>,
    private readonly attribute: AttributeBuilder<M, N, any>,
    private readonly collection: "Array" | "Set"
  ) {}

  ofPrimitives(
    clazz:
      | Constructor
      | (() => Constructor)
      | (Constructor | (() => Constructor))[],
    message?: string
  ): ModelBuilder<M> {
    this.attribute.list(clazz, this.collection, message);
    return this.parent;
  }

  ofModel<MM extends BuildableModel>(): ModelBuilder<MM> {
    const nestedBuilder = ModelBuilder.builder<MM>();
    const originalBuild = nestedBuilder.build;
    let cachedConstructor: Constructor<MM> | undefined;

    const factory = (() => {
      return function () {
        if (!cachedConstructor) {
          cachedConstructor = Reflect.apply(
            originalBuild,
            nestedBuilder,
            []
          ) as Constructor<MM>;
        }
        return cachedConstructor;
      };
    })();

    this.attribute.list(factory as any, this.collection);

    nestedBuilder.build = new Proxy(originalBuild, {
      apply: (
        target: () => Constructor<M>,
        thisArg: ModelBuilder<MM>,
        argArray: any[]
      ): ModelBuilder<M> => {
        cachedConstructor = Reflect.apply(target, thisArg, argArray) as
          | Constructor<MM>
          | undefined;
        return this.parent;
      },
    });

    return nestedBuilder;
  }
}

export class ModelBuilder<
  M extends BuildableModel = BuildableModel,
> extends ObjectAccumulator<M> {
  private attributes: Map<keyof M, AttributeBuilder<M, keyof M, any>> =
    new Map();
  private _name?: string;

  private _parent?: Constructor<M>;

  setName(name: string) {
    this._name = name;
    return this;
  }

  private attribute<T, N extends keyof M>(attr: N, type: T) {
    const existing = this.attributes.get(attr);
    if (existing) {
      if ((existing as AttributeBuilder<M, N, T>).declaredType !== type)
        throw new Error(
          `Attribute "${String(attr)}" already exists with a different type`
        );
      return existing as AttributeBuilder<M, N, T>;
    }
    const attributeBuilder = new AttributeBuilder<M, N, T>(
      this,
      attr as any,
      type
    );
    this.attributes.set(attr, attributeBuilder);
    return attributeBuilder;
  }

  string<N extends keyof M>(attr: N) {
    return this.attribute(attr, String);
  }

  number<N extends keyof M>(attr: N) {
    return this.attribute(attr, Number);
  }

  date<N extends keyof M>(attr: N) {
    return this.attribute(attr, Date);
  }

  bigint<N extends keyof M>(attr: N) {
    return this.attribute(attr, BigInt);
  }

  instance<N extends keyof M>(clazz: Constructor<any>, attr: N) {
    return this.attribute(attr, clazz);
  }

  model<MM extends Model, N extends keyof M>(attr: N): ModelBuilder<MM> {
    const mm = new ModelBuilder<MM>();
    mm.build = new Proxy(mm.build, {
      apply: (target, thisArg, argArray: any[]) => {
        const built = Reflect.apply(target, thisArg, argArray);
        return this.instance(built, attr);
      },
    });
    return mm;
  }

  listOf<N extends keyof M>(
    attr: N,
    collection: "Array" | "Set" = "Array"
  ): ListAttributeBuilder<M, N> {
    const listType = (collection === "Set" ? Set : Array) as any;
    const attribute = this.attribute(attr, listType);
    return new ListAttributeBuilder(this, attribute, collection);
  }

  build(): Constructor<M> {
    if (!this._name) throw new Error("name is required");

    const Parent = this._parent ?? Model;
    class DynamicBuiltClass extends Parent {
      constructor(arg?: ModelArg<M>) {
        super(arg as any);
      }
    }

    Object.defineProperty(DynamicBuiltClass, "name", {
      value: this._name,
      writable: false,
    });

    for (const attribute of this.attributes.values()) {
      attribute.build(DynamicBuiltClass as Constructor<M>);
    }

    return model()(DynamicBuiltClass);
  }

  static builder<M extends BuildableModel = BuildableModel>() {
    return new ModelBuilder<M>();
  }

  static from<N extends Model, M extends ExtendedMetadata<N>>(
    meta: M,
    name?: string
  ): Constructor<N> {
    if (!meta) throw new Error("metadata is required");
    const builder = ModelBuilder.builder<N>();
    const derivedName = name ?? `GeneratedModel${Date.now()}`;
    builder.setName(derivedName);

    const properties = (meta as ExtendedMetadata<N>).properties || {};
    const validations = (meta as ExtendedMetadata<N>).validation || {};

    for (const [prop, designType] of Object.entries(properties)) {
      const attribute = (builder as any).attribute(
        prop as keyof N,
        (designType as Constructor) || Object
      ) as AttributeBuilder<N, keyof N, any>;
      const propValidation = (validations as any)[prop];
      if (propValidation) {
        for (const [key, validationMeta] of Object.entries(
          propValidation as Record<string, any>
        )) {
          const handler = (attribute as any)[key];
          if (typeof handler === "function") {
            handler.call(attribute, validationMeta);
            continue;
          }
          try {
            const decoratorFactory = Validation.decoratorFromKey(key);
            const decorator =
              typeof decoratorFactory === "function"
                ? decoratorFactory(validationMeta)
                : decoratorFactory;
            attribute.decorate(decorator);
          } catch {
            // ignore unknown decorators
          }
        }
      }
    }

    return builder.build();
  }
}
