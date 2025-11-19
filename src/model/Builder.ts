import { Model } from "./Model";
import { ModelArg } from "./types";
import { ObjectAccumulator } from "typed-object-accumulator";
import { Constructor, DecorationKeys, prop } from "@decaf-ts/decoration";
import { model } from "./decorators";
import { ExtendedMetadata } from "../overrides/index";

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
    readonly type: T
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

    if (this.type) {
      Reflect.defineMetadata(
        DecorationKeys.DESIGN_TYPE,
        this.type,
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
    if (this.attributes.has(attr))
      throw new Error(`Attribute "${String(attr)}" already exists`);
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

  build(): Constructor<M> {
    if (!this._name) throw new Error("name is required");

    const Parent = this._parent ?? Model;
    const DynamicBuiltClass = class extends Parent {
      constructor(arg?: ModelArg<M>) {
        super(arg as any);
      }
    };

    Object.defineProperty(DynamicBuiltClass, "name", {
      value: this._name,
      writable: false,
    });

    for (const attribute of this.attributes.values()) {
      attribute.build(DynamicBuiltClass as Constructor<M>);
    }

    const DecoratedClass =
      (model()(DynamicBuiltClass) as Constructor<M>) ||
      (DynamicBuiltClass as Constructor<M>);

    return DecoratedClass;
  }

  static builder<M extends BuildableModel = BuildableModel>() {
    return new ModelBuilder<M>();
  }

  static from<N extends Model, M extends ExtendedMetadata<N>>(
    meta: M,
    name?: string
  ): Constructor<N> {
    const builder = new ModelBuilder<N>();
    if (name) builder.setName(name);
    else builder.setName("Class" + Date.now());
  }
}
