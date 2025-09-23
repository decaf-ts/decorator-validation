import { Model } from "../model/Model";
import { Constructor } from "@decaf-ts/decoration";
import { ExtendedMetadata } from "./types";

declare module "@decaf-ts/decoration" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Metadata {
    function validations<M extends Model>(
      model: Constructor<M>,
      property: keyof M
    ): any;

    /**
     * @description Retrieves metadata for a model or a specific key within it
     * @summary When called with a constructor only, returns the entire metadata object associated with the model. When a key path is provided, returns the value stored at that nested key.
     * @template M
     * @template META
     * @param {Constructor<M>} model The target constructor used to locate the metadata record
     * @return {META|undefined} The metadata object, the value at the key path, or undefined if nothing exists
     */
    // @ts-expect-error override magic
    function get<M, META extends ExtendedMetadata<M> = ExtendedMetadata<M>>(
      model: Constructor<M>
    ): META | undefined;
  }
}
