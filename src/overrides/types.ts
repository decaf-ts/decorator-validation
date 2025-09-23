import { BasicMetadata } from "@decaf-ts/decoration";

export type ValidationMetadata<M> = BasicMetadata<M> & {
  validations: any;
};
