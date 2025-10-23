import { BasicMetadata } from "@decaf-ts/decoration";

export type ExtendedMetadata<M> = BasicMetadata<M> & {
  validation: Record<keyof M, Record<string, any>>;
};

export type designTypeReturn = {
  designTypes: any[];
  designType: any;
};
