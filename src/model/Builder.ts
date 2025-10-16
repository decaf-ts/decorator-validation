import "reflect-metadata";
import { metadata } from "@decaf-ts/reflection";
import { Model } from "./Model";
import { Constructor, ModelArg } from "./types";
import { ObjectAccumulator } from "typed-object-accumulator";
import { ModelKeys } from "../utils/constants";
import { prop } from "../utils/decorators";
import { Validation } from "../validation/Validation";
import { ValidationKeys } from "../validation/Validators/constants";

export interface DecorateOption<M extends Model, Self> {
  decorate(...decorators: PropertyDecorator[]): ModelBuilder<M>;
  use(key: string, ...args: any[]): Self;
  undecorate(...decorators: (PropertyDecorator | string)[]): Self;
}

type AttributeDesignType = Function | { new (...args: any[]): any };

interface AttributeDecoratorEntry {
  key?: string;
  factory: () => PropertyDecorator;
}

interface AttributeDefinition {
  name: string;
  designType: AttributeDesignType;
  decorators: AttributeDecoratorEntry[];
  keyedDecorators: Map<string, AttributeDecoratorEntry>;
  manualDecorators: Map<PropertyDecorator, AttributeDecoratorEntry>;
}

interface AttributeTypeToken<T> {
  designType: AttributeDesignType;
  example?: T;
}

function aliasFromKey(key: string) {
  const segments = key.split(".");
  return segments[segments.length - 1] || key;
}

function resolveDecoratorKey(key: string) {
  const available = Validation.decorators();
  for (const registeredKey of available) {
    if (registeredKey === key) return registeredKey;
    if (aliasFromKey(registeredKey) === key) return registeredKey;
  }
  return undefined;
}

function createAttributeDefinition(
  name: string,
  designType: AttributeDesignType
): AttributeDefinition {
  return {
    name,
    designType,
    decorators: [],
    keyedDecorators: new Map(),
    manualDecorators: new Map(),
  };
}

export class AttributeBuilder<M extends Model, N extends keyof M, T>
  implements
    DecorateOption<M, AttributeBuilder<M, N, T> & ModelBuilder<M>>
{
  private readonly proxy: AttributeBuilder<M, N, T> & ModelBuilder<M>;

  constructor(
    protected parent: ModelBuilder<M>,
    private readonly definition: AttributeDefinition
  ) {
    this.proxy = new Proxy(this, {
      get: (target, prop, receiver) => {
        const value = Reflect.get(target, prop, receiver);
        if (value !== undefined) {
          if (typeof value === "function") return value.bind(target);
          return value;
        }

        if (typeof prop === "string") {
          if (prop === "parent") return target.parent;
          const resolvedKey = resolveDecoratorKey(prop);
          if (resolvedKey) {
            return (...args: any[]) => {
              target.applyValidationDecorator(resolvedKey, args);
              return receiver;
            };
          }
          if (prop in target.parent) {
            const parentValue = (target.parent as any)[prop];
            if (typeof parentValue === "function")
              return parentValue.bind(target.parent);
            return parentValue;
          }
        }

        return undefined;
      },
    }) as AttributeBuilder<M, N, T> & ModelBuilder<M>;

    return this.proxy;
  }

  private addDecorator(
    entry: AttributeDecoratorEntry,
    key?: string,
    original?: PropertyDecorator
  ) {
    if (key) {
      const resolved = resolveDecoratorKey(key) || key;
      if (this.definition.keyedDecorators.has(resolved))
        throw new Error(`Decorator "${resolved}" has already been used on ${this.definition.name}`);
      this.definition.keyedDecorators.set(resolved, entry);
    }

    if (original) {
      if (this.definition.manualDecorators.has(original))
        throw new Error(`Provided decorator has already been applied to ${this.definition.name}`);
      this.definition.manualDecorators.set(original, entry);
    }

    this.definition.decorators.push(entry);
  }

  private applyValidationDecorator(
    key: string,
    args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    const resolvedKey = resolveDecoratorKey(key);
    if (!resolvedKey)
      throw new Error(`No decorator registered under ${key}`);

    const decoratorFactory = Validation.decoratorFromKey(resolvedKey) as any;
    let decorator: PropertyDecorator;

    if (typeof decoratorFactory !== "function")
      throw new Error(`Decorator factory for ${resolvedKey} is not callable`);

    const maybeDecorator = decoratorFactory(...args);
    decorator =
      typeof maybeDecorator === "function"
        ? (maybeDecorator as PropertyDecorator)
        : (decoratorFactory as PropertyDecorator);

    this.addDecorator({
      key: resolvedKey,
      factory: () => {
        const produced = decoratorFactory(...args);
        if (typeof produced === "function") return produced;
        return decorator;
      },
    }, resolvedKey);

    return this.proxy;
  }

  decorate(...decorators: PropertyDecorator[]): ModelBuilder<M> {
    for (const decorator of decorators) {
      if (typeof decorator !== "function")
        throw new Error("Decorator must be a function");
      this.addDecorator(
        {
          factory: () => decorator,
        },
        undefined,
        decorator
      );
    }
    return this.parent;
  }

  use(
    key: string,
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(key, args);
  }

  undecorate(
    ...decorators: (PropertyDecorator | string)[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    for (const decorator of decorators) {
      if (typeof decorator === "string") {
        const resolvedKey = resolveDecoratorKey(decorator) || decorator;
        const entry = this.definition.keyedDecorators.get(resolvedKey);
        if (!entry)
          throw new Error(
            `Decorator "${resolvedKey}" is not applied to ${this.definition.name}`
          );
        this.definition.keyedDecorators.delete(resolvedKey);
        const index = this.definition.decorators.indexOf(entry);
        if (index >= 0) this.definition.decorators.splice(index, 1);
      } else {
        const entry = this.definition.manualDecorators.get(decorator);
        if (!entry)
          throw new Error(
            `Decorator "${decorator.name || "anonymous"}" is not applied to ${this.definition.name}`
          );
        this.definition.manualDecorators.delete(decorator);
        const index = this.definition.decorators.indexOf(entry);
        if (index >= 0) this.definition.decorators.splice(index, 1);
      }
    }
    return this.proxy;
  }

  done(): ModelBuilder<M> {
    return this.parent;
  }

  required(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.REQUIRED, args);
  }

  minlength(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.MIN_LENGTH, args);
  }

  maxlength(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.MAX_LENGTH, args);
  }

  min(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.MIN, args);
  }

  max(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.MAX, args);
  }

  step(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.STEP, args);
  }

  pattern(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.PATTERN, args);
  }

  email(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.EMAIL, args);
  }

  url(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.URL, args);
  }

  date(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.DATE, args);
  }

  type(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.TYPE, args);
  }

  list(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.LIST, args);
  }

  password(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.PASSWORD, args);
  }

  unique(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.UNIQUE, args);
  }

  validator(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.VALIDATOR, args);
  }

  equals(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.EQUALS, args);
  }

  different(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.DIFF, args);
  }

  lessThan(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.LESS_THAN, args);
  }

  lessThanOrEqual(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.LESS_THAN_OR_EQUAL, args);
  }

  greaterThan(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.GREATER_THAN, args);
  }

  greaterThanOrEqual(
    ...args: any[]
  ): AttributeBuilder<M, N, T> & ModelBuilder<M> {
    return this.applyValidationDecorator(ValidationKeys.GREATER_THAN_OR_EQUAL, args);
  }
}

export class ModelBuilder<
  M extends Model = Model,
> extends ObjectAccumulator<M> {
  private static sequence = 0;

  private attributes: Map<string, AttributeDefinition> = new Map();
  private _name?: string;

  private _parent?: Constructor<Model>;

  setName(name: string) {
    this._name = name;
    return this;
  }

  setParent<P extends Model>(parent: Constructor<P>) {
    this._parent = parent as Constructor<Model>;
    return this as unknown as ModelBuilder<M & P>;
  }

  private attribute<N extends string, T>(
    attr: N,
    type: AttributeTypeToken<T>
  ): AttributeBuilder<M & Record<N, T>, N, T> & ModelBuilder<M & Record<N, T>> {
    if (this.attributes.has(attr))
      throw new Error(`Attribute "${attr}" has already been defined`);

    const definition = createAttributeDefinition(attr, type.designType);
    this.attributes.set(attr, definition);

    this.accumulate({
      [attr]: undefined,
    });

    const attributeBuilder = new AttributeBuilder<M & Record<N, T>, N, T>(
      this as unknown as ModelBuilder<M & Record<N, T>>,
      definition
    );

    return attributeBuilder as AttributeBuilder<
      M & Record<N, T>,
      N,
      T
    > & ModelBuilder<M & Record<N, T>>;
  }

  string<N extends string>(attr: N) {
    return this.attribute<N, string>(attr, { designType: String });
  }

  number<N extends string>(attr: N) {
    return this.attribute<N, number>(attr, { designType: Number });
  }

  date<N extends string>(attr: N) {
    return this.attribute<N, Date>(attr, { designType: Date });
  }

  bigint<N extends string>(attr: N) {
    // BigInt does not have a constructable type, metadata still receives the BigInt function reference
    return this.attribute<N, bigint>(attr, { designType: BigInt as unknown as AttributeDesignType });
  }

  instance<N extends string, C extends Constructor<any>>(clazz: C, attr: N) {
    return this.attribute<
      N,
      InstanceType<C>
    >(attr, { designType: clazz });
  }

  private getParentClass(): Constructor<Model> {
    return (this._parent || Model) as Constructor<Model>;
  }

  private applyAttribute(
    ctor: Constructor<Model>,
    definition: AttributeDefinition
  ) {
    const descriptor = Object.getOwnPropertyDescriptor(
      ctor.prototype,
      definition.name
    );

    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(ctor.prototype, definition.name, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: undefined,
      });
    }

    Reflect.defineMetadata(
      ModelKeys.TYPE,
      definition.designType,
      ctor.prototype,
      definition.name
    );

    prop()(ctor.prototype, definition.name);

    for (const entry of definition.decorators) {
      const decorator = entry.factory();
      decorator(ctor.prototype, definition.name);
    }
  }

  build(): Constructor<M> {
    if (!this._name) throw new Error("name is required");

    const parent = this.getParentClass();
    const uniqueName = `${this._name}_${ModelBuilder.sequence++}`;

    const DynamicBuiltClass = class DynamicModel extends parent {
      constructor(arg?: ModelArg<M>) {
        super(arg as any);
        Model.fromObject(this, arg as any);
      }
    } as unknown as Constructor<M>;

    Object.defineProperty(DynamicBuiltClass, "name", {
      value: uniqueName,
      writable: false,
    });

    for (const definition of this.attributes.values()) {
      this.applyAttribute(DynamicBuiltClass as unknown as Constructor<Model>, definition);
    }

    metadata(Model.key(ModelKeys.MODEL), uniqueName)(
      DynamicBuiltClass as unknown as Constructor<Model>
    );
    Model.register(DynamicBuiltClass as Constructor<Model>, uniqueName);

    return DynamicBuiltClass;
  }

  static get builder() {
    return new ModelBuilder();
  }
}
