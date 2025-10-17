import "./../../validation/overrides";
import { Model } from "../Model";
import { Metadata } from "@decaf-ts/decoration";
import { Primitives } from "../constants";
import { AttributeDefinition } from "./types";

export class AttributeBuilder<M extends Model = Model> {
  protected decoration: Record<keyof M, AttributeDefinition<any>> = {};

  protected constructor(protected parent: any) {}

  private addToBuilder<
    K extends PropertyKey,
    H extends (this: AttributeBuilder<any>, ...args: any[]) => any,
  >(
    propName: K,
    handler: H
  ): AttributeBuilder<
    M & { [P in K]: (...args: Parameters<H>) => ReturnType<H> }
  > {
    const builderMethod = function (
      this: AttributeBuilder<M>,
      ...args: Parameters<H>
    ): ReturnType<H> {
      return handler.apply(this, args as any);
    };

    // Attach the method (runtime), while keeping the widened compile-time type.
    (this as any)[propName] = builderMethod;
    return this as any;
  }

  private fromPrimitives(primitives = Primitives) {
    Object.values(primitives).forEach((value) => {
      this.addToBuilder(value);
    });
  }

  private fromMetadata(): AttributeBuilder<M> {
    const validationKeys = Metadata.decoration.forProperty();
  }
}
