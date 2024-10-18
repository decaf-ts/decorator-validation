import { ModelErrors } from "../validation/types";

/**
 * @summary Helper Class to hold the error results
 * @description holds error results in an 'indexable' manner
 * while still providing the same result on toString
 *
 * @param {ModelErrors} errors
 *
 * @class ModelErrorDefinition
 *
 * @category Model
 */
export class ModelErrorDefinition {
  [indexer: string]:
    | Record<string, string | undefined>
    | (() => string | undefined);

  constructor(errors: ModelErrors) {
    for (const prop in errors) {
      if (Object.prototype.hasOwnProperty.call(errors, prop) && errors[prop])
        Object.defineProperty(this as any, prop, {
          enumerable: true,
          configurable: false,
          value: errors[prop],
          writable: false,
        });
    }
  }

  /**
   * @summary Outputs the class to a nice readable string
   *
   * @override
   */
  toString(): string {
    const self: any = this as any;
    return Object.keys(self)
      .filter(
        (k) =>
          Object.prototype.hasOwnProperty.call(self, k) &&
          typeof self[k] !== "function"
      )
      .reduce((accum: string, prop) => {
        let propError: string | undefined = Object.keys(self[prop]).reduce(
          (propAccum: undefined | string, key) => {
            if (!propAccum) propAccum = self[prop][key];
            else propAccum += `\n${self[prop][key]}`;
            return propAccum;
          },
          undefined
        );

        if (propError) {
          propError = `${prop} - ${propError}`;
          if (!accum) accum = propError;
          else accum += `\n${propError}`;
        }

        return accum;
      }, "");
  }
}
