import { ValidatorOptions } from "../../validation/index";
import { Constructor } from "@decaf-ts/decoration";

export type AttributeDesignType = (
  ...args: any
) => any | Constructor<any> | undefined;

export interface AttributeDecoratorEntry {
  key?: string;
  factory: () => PropertyDecorator;
}

export interface AttributeDefinition<V extends ValidatorOptions> {
  name: string;
  designType: AttributeDesignType;
  decorators: Record<
    string,
    {
      decorator: any;
      metadata: V;
    }
  >;
}
