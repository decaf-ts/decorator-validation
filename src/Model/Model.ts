import { validate} from "../validation";
import Validatable from "../validation/types";
import {isEqual, hash, lastXDigitsOf} from "../utils";
import ModelErrorDefinition from "./ModelErrorDefinition";

/**
 * Abstract class representing a Validatable Model object
 *
 * Model objects must:
 *  - Have all their properties defined as optional;
 *  - Have all their properties initialized (only the '@required()' decorated properties
 *  <strong>need</strong> to be initialized, but all of them should be as good practice);
 *
 * @class Model
 * @abstract
 * @implements Validatable
 * @namespace Model
 * @memberOf Model
 */
export default abstract class Model implements Validatable {
    [indexer: string]: any;
    /**
     * @param {Model | {}} model base object from which to populate properties from
     * @constructor
     * @protected
     * @see Model#constructFromObject
     */
    protected constructor(model?: Model | {}){
        Model.constructFromObject(this, model);
    }

    /**
     * Validates the object according to its decorated properties
     *
     * @param {any} [args]
     * @memberOf Model
     * @see validate
     */
    public hasErrors(...args: any[]): ModelErrorDefinition | undefined{
        return validate(this);
    }

    /**
     * Compare object equality recursively
     * @param {any} obj object to compare to
     * @param {string} [exceptions] property names to be excluded from the comparison
     * @memberOf Model
     */
    public equals(obj: any, ...exceptions: string[]): boolean {
        return isEqual(this, obj, ...exceptions);
    }

    /**
     * Override the implementation for js's 'toString()' which sucks...
     */
    public toString(){
        return this.constructor.name +": " + JSON.stringify(this, undefined, 2);
    }

    /**
     * Default implementation. Relies on Java's string hash implementation underneath
     */
    public toHash() : string{

        const hashFunction = function(value: any){
            if (['string', 'char', 'number', 'date', 'symbol'].indexOf(typeof value) !== -1)
                return hash(value);
            return hash(JSON.stringify(value));
        }

        return Object.values(this).reduce((ac, v) =>{
            return lastXDigitsOf(ac + 31 * hashFunction(v), 32);
        }, 0) + '';
    }

    /**
     * repopulates the Object properties with the ones from the new object
     *
     * @param {T} self
     * @param {T| {}} obj
     * @static
     * @function constructFromObject
     * @memberOf Model
     */
    public static constructFromObject<T extends Model>(self: T, obj?: T | {}){
        for (let prop in obj)
            if(obj.hasOwnProperty(prop) && self.hasOwnProperty(prop))// @ts-ignore
                self[prop] = obj[prop];
        return self;
    }
}