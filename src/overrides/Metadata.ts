import { Constructor, Model } from "../model/index";
// @ts-expect-error override magic
declare module "@decaf-ts/decoration" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Metadata {
    function validations<M extends Model>(
      model: Constructor<M>,
      property: string
    ): any;
  }
}
