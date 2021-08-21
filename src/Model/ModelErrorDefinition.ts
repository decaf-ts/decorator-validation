import {Errors, ModelErrors} from "../validation";

export default class ModelErrorDefinition{
    [indexer: string]: {[indexer: string]: Errors} | (() => Errors);

    constructor(errors: ModelErrors) {
        for(let prop in errors){
            if (errors.hasOwnProperty(prop) && errors[prop])
                Object.defineProperty(this, prop, {
                    enumerable: true,
                    configurable: false,
                    value: errors[prop],
                    writable: false
                });
        }
    }

    toString(): Errors{
        const self = this;
        return Object.keys(self).filter(k => self.hasOwnProperty(k) && typeof self[k] !== 'function').reduce((accum: undefined | string, prop) => {
            const propError: string | undefined = Object.keys(self[prop]).reduce((propAccum: undefined | string, key) => {
                if (!propAccum) // @ts-ignore
                    propAccum = self[prop][key];
                else // @ts-ignore
                    propAccum += `\n${self[prop][key]}`;
                return propAccum;
            }, undefined);

            if (propError)
                if (!accum)
                    accum = propError;
                else
                    accum = accum += `\n${propError}`
            return accum;
        }, undefined);
    }
}