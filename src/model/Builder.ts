// import { Model } from "./Model";
// import { Constructor, ModelArg } from "./types";
// import { ObjectAccumulator } from "typed-object-accumulator";
//
// export interface DecorateOption<M extends Model> {
//   decorate(...decorators: PropertyDecorator[]): ModelBuilder<M>;
// }
//
// export class AttributeBuilder<M extends Model, N extends keyof M, T>
//   implements DecorateOption<M>
// {
//   constructor(
//     protected parent: ModelBuilder<M>,
//     readonly attr: keyof M,
//     readonly type: T
//   ) {}
//
//   private decorators: Set<PropertyDecorator> = new Set();
//
//   decorate(...decorators: PropertyDecorator[]): ModelBuilder<M> {
//     for (const decorator of decorators) {
//       if (this.decorators.has(decorator))
//         throw new Error(`Decorator "${decorator}" has already been used`);
//       this.decorators.add(decorator);
//     }
//     return this.parent;
//   }
//
//   undecorate(...decorators: PropertyDecorator[]) {
//     for (const decorator of decorators) {
//       if (!this.decorators.has(decorator))
//         throw new Error(
//           `Decorator "${decorator}" is not applied to ${this.attr as string}`
//         );
//       this.decorators.delete(decorator);
//     }
//     return this.parent;
//   }
//
//   apply(obj: Constructor<M>): ModelBuilder<M> {
//     Object.defineProperty(obj, this.attr, {
//       value: undefined,
//     });
//     this.decorators.forEach((decorator) => {
//       try {
//         decorator(obj, this.attr as any);
//       } catch (e: unknown) {
//         throw new Error(
//           `Failed to apply decorator to property "${this.attr as any}": ${e}`
//         );
//       }
//     });
//     //
//     // const c = `${this.attr.toString()}` as const;
//     //
//     // const temp: {
//     //   [c]: T
//     // } = {
//     //   [this.attr]: 0
//     // }
//
//     return this.parent.accumulate() as unknown as ModelBuilder<M & Record<N, T>>;
//   }
// }
//
// export class ModelBuilder<M extends Model = Model> extends ObjectAccumulator<M>{
//   private attributes: Map<string, AttributeBuilder<M, any, any>> = new Map();
//   private _name?: string;
//
//   private _parent?: Constructor<M>;
//
//   setName(name: string) {
//     this._name = name;
//     return this;
//   }
//
//   private attribute<T, N extends symbol>(
//     attr: string,
//     type: T
//   ): AttributeBuilder<M, N, T> {
//     return new AttributeBuilder<M, N, T>(this, attr as any, type);
//   }
//
//   string(attr: string) {
//     return this.attribute(attr, String.name);
//   }
//
//   number(attr: string) {
//     return this.attribute(attr, Number.name);
//   }
//
//   date(attr: string) {
//     return this.attribute(attr, Date.name);
//   }
//
//   bigint(attr: string) {
//     return this.attribute(attr, BigInt.name);
//   }
//
//   instance(clazz: Constructor<any>, attr: string) {
//     return this.attribute(attr, clazz.name);
//   }
//
//   build(): Constructor<M> {
//     if (!this._name) throw new Error("name is required");
//
//     const DynamicBuiltClass = class<M> extends Model {
//       constructor(arg?: ModelArg<M>) {
//         super(arg as any);
//       }
//     };
//
//     Object.defineProperty(DynamicBuiltClass, "name", {
//       value: this._name,
//       writable: false,
//     });
//
//     this.attributes.forEach((attribute) => {
//       attribute.apply(DynamicBuiltClass as any);
//     });
//
//     return DynamicBuiltClass as unknown as Constructor<M>;
//   }
//
//   static get builder() {
//     return new ModelBuilder();
//   }
// }
