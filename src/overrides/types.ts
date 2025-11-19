import { BasicMetadata } from "@decaf-ts/decoration";
import { ValidatorOptions } from "../validation/index";

export type ExtendedMetadata<M> = BasicMetadata<M> & {
  validation: Record<keyof M, ValidatorOptions>;
};

export type designTypeReturn = {
  designTypes: any[];
  designType: any;
};
