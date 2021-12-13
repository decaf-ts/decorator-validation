import { validate} from "../validation";
import Validatable from "../validation/types";
import {isEqual, hashObj, constructFromObject} from "../utils/utils";
import ModelErrorDefinition from "./ModelErrorDefinition";


/**
 * Abstract class representing a Validatable Model object
 *
 * Model objects must:
 *  - Have all their properties defined as optional;
 *  - Have all their properties initialized eg:
 *
 *  <pre>
 *      class ClassName {
 *
 *          propertyName?: PropertyType = undefined;
 *
 *      }
 *  </pre>
 *
 * @class Model
 * @abstract
 * @implements Validatable
 *
 * @memberOf model
 */
export default abstract class Model implements Validatable {
    [indexer: string]: any;
    /**
     * @param {Model | {}} model base object from which to populate properties from
     * @constructor
     * @protected
     * @see constructFromObject
     */
    protected constructor(model?: Model | {}){
       constructFromObject<Model>(this, model);
    }

    /**
     * Validates the object according to its decorated properties
     *
     * @param {any[]} [exceptions] properties in the object to be ignored for he validation. Marked as 'any' to allow for extension but expects strings
     * @memberOf Model
     * @see validate
     */
    public hasErrors(...exceptions: any[]): ModelErrorDefinition | undefined {
        return validate(this, ...exceptions);
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
     * @override
     * @memberOf Model
     */
    public toString(): string {
        return this.constructor.name +": " + JSON.stringify(this, undefined, 2);
    }

    /**
     * Defines a default implementation for object hash. Relies on a very basic implementation based on Java's string hash;
     * @memberOf Model
     */
    public toHash(): string{
        return hashObj(this).toString();
    }
}