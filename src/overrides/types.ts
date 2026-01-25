import { BasicMetadata } from "@decaf-ts/decoration";
import { ValidatorOptions } from "../validation/types";

export type ExtendedMetadata<M> = BasicMetadata<M> & {
  validation: Record<keyof M, ValidatorOptions>;
};

/**
 * @description Return type for design type information.
 * @summary Defines the structure of the return type for functions that provide design type information.
 * @property {any[]} designTypes An array of design types.
 * @property {any} designType The primary design type.
 * @typedef {object} designTypeReturn
 * @memberOf module:decorator-validation
 */
export type designTypeReturn = {
  designTypes: any[];
  designType: any;
};
