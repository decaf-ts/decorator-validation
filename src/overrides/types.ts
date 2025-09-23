import { BasicMetadata } from "@decaf-ts/decoration";

export type ExtendedMetadata<M> = BasicMetadata<M> & {
  validations: Record<keyof M, Record<string, any>>;
};
