import { Errors, ModelErrors } from "../validation";

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
  [indexer: string]: Record<string, Errors> | (() => Errors);

  constructor(errors: ModelErrors) {
    for (const prop in errors) {
      if (errors.hasOwnProperty(prop) && errors[prop])
        Object.defineProperty(this, prop, {
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
    const self = this;
    return Object.keys(self)
      .filter((k) => self.hasOwnProperty(k) && typeof self[k] !== "function")
      .reduce((accum: string, prop) => {
        let propError: string | undefined = Object.keys(self[prop]).reduce(
          (propAccum: undefined | string, key) => {
            if (!propAccum)
              // @ts-expect-error because i said so
              propAccum = self[prop][key];
            // @ts-expect-error because i said so
            else propAccum += `\n${self[prop][key]}`;
            return propAccum;
          },
          undefined,
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
