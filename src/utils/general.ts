import "reflect-metadata";
import {DecoratorMetadata, MONTH_NAMES} from "../validation";
import {ModelKeys} from "./constants";
import {Model} from "../model";


/**
 * @summary Util function to retrieve the decorators for the provided Property
 *
 * @param {string} annotationPrefix
 * @param {any} target
 * @param {string | symbol} propertyName
 * @param {boolean} [ignoreType] defaults to false. decides if the {@link ModelKeys.TYPE} is ignored or not
 * @param {boolean} [recursive] defaults to true. decides if it should climb the prototypal tree searching for more decorators on that property
 * @param {DecoratorMetadata[]} [accumulator] used when recursive is true, to cache decorators while it climbs the prototypal tree
 *
 * @function getPropertyDecorators
 * @memberOf module:decorator-validation.Reflection
 * @category Reflection
 */
export function getPropertyDecorators(annotationPrefix: string, target: any, propertyName: string | symbol, ignoreType: boolean = false, recursive = true, accumulator?: DecoratorMetadata[]): {prop: string, decorators: DecoratorMetadata[]} {

    const getPropertyDecoratorsForModel = function(annotationPrefix: string, target: any, propertyName: string | symbol, ignoreType: boolean = false, accumulator?: DecoratorMetadata[]): {prop: string, decorators: DecoratorMetadata[]} {
        // get info about keys that used in current property
        const keys: any[] = Reflect.getMetadataKeys(target, propertyName);
        const decorators: DecoratorMetadata[] = keys
            // filter your custom decorators
            .filter(key => {
                if (ignoreType)
                    return key.toString().startsWith(annotationPrefix);
                return key === ModelKeys.TYPE || key.toString().startsWith(annotationPrefix)
            }).reduce((values, key) => {
                // get metadata value.
                const currValues = {
                    key: key !== ModelKeys.TYPE ? key.substring(annotationPrefix.length) : key,
                    props: Reflect.getMetadata(key, target, propertyName)
                };
                return values.concat(currValues);
            }, accumulator || []);

        return {
            prop: propertyName.toString(),
            decorators: decorators
        };
    }

    const result: {prop: string, decorators: DecoratorMetadata[]} = getPropertyDecoratorsForModel(annotationPrefix, target, propertyName, ignoreType, accumulator);

    const trim = function(items: DecoratorMetadata[]){
        const cache: Record<string, DecoratorMetadata> = {};
        return items.filter(item => {
            if (item.key in cache){
                if (!isEqual(item.props, cache[item.key]))
                    console.log(stringFormat("Found a similar decorator for the {0} property of a {1} model but with different attributes. The original one will be kept", item.key, target.constructor.name));
                return false;
            }

            cache[item.key.toString()] = item.props as DecoratorMetadata;
            return true;
        });
    }

    if (!recursive || Object.getPrototypeOf(target) === Object.prototype){
        return {
            prop: result.prop,
            decorators: trim(result.decorators)
        };
    }

    // We choose to ignore type here, because in inheritance the expected type is from the lowest child class
    return getPropertyDecorators(annotationPrefix, Object.getPrototypeOf(target.constructor), propertyName, true, recursive, result.decorators);
}

/**
 * @summary gets the prop type from the decorator
 * @param {any} model
 * @param {string | symbol} propKey
 * @return {string | undefined}
 *
 * @function geTypeFromDecorators
 *
 * @memberOf module:decorator-validation.Reflection
 */
export function getTypeFromDecorator(model: any, propKey: string | symbol): string | undefined {
    const decorators: {prop: string | symbol, decorators: any[]} = getPropertyDecorators(ModelKeys.REFLECT, model, propKey, false);
    if (!decorators || !decorators.decorators)
        return;

    // TODO handle @type decorators. for now we stick with design:type
    const typeDecorator = decorators.decorators.shift();
    const name = typeDecorator.props ? typeDecorator.props.name : undefined;
    return name !== "Function" ? name : undefined;
}


/**
 * @summary Retrieves the decorators for an object's properties prefixed by {@param prefixes}
 *
 * @param {T} model
 * @param {string[]} prefixes
 *
 * @function getAllPropertyDecorators
 *
 * @memberOf module:db-decorators.Reflection
 */
export const getAllPropertyDecorators = function <T extends Model>(model: T, ...prefixes: string[]): Record<string, any> | undefined {
    if (!prefixes || !prefixes.length)
        return;

    const pushOrCreate = function (accum: Record<string, Record<string, any>>, key: string, decorators: any[]) {
        if (!decorators || !decorators.length)
            return;
        if (!accum[key])
            accum[key] = [];
        accum[key].push(...decorators);
    }

    return Object.getOwnPropertyNames(model).reduce((accum: {} | undefined, propKey) => {
        prefixes.forEach((p, index) => {
            const decorators: { prop: string | symbol, decorators: any[] } = getPropertyDecorators(p, model, propKey, index !== 0);
            if (!accum)
                accum = {};
            pushOrCreate(accum, propKey, decorators.decorators);
        });
        return accum;
    }, undefined);
}

/**
 * @summary Retrieves all properties of an object
 * @description
 *  - and of all its prototypes if {@param climbTree} until it reaches {@param stopAt} (or ends the prototype chain)
 *
 * @param obj
 * @param {boolean} [climbTree] default to true
 * @param {string} [stopAt] defaults to 'Object'
 *
 * @function getAllProperties
 *
 * @memberOf module:decorator-validation.Model
 */
export function getAllProperties(obj: Record<any, any>, climbTree = true, stopAt = 'Object'){
    const allProps: string[] = [];
    let curr: Record<any, any> = obj

    const keepAtIt = function(){
        if (!climbTree)
            return;
        let prototype = Object.getPrototypeOf(curr);
        if (!prototype || prototype.constructor.name === stopAt)
            return;
        curr = prototype;
        return curr;
    }

    do{
        let props = Object.getOwnPropertyNames(curr)
        props.forEach(function(prop){
            if (allProps.indexOf(prop) === -1)
                allProps.push(prop)
        })
    } while(keepAtIt())
    return allProps
}

/**
 * @summary Util function to provide string format functionality similar to C#'s string.format
 *
 * @param {string} string
 * @param {string} args replacements made by order of appearance (replacement0 wil replace {0} and so on)
 * @return {string} formatted string
 *
 * @function stringFormat
 * @memberOf module:decorator-validation.Utils.Format
 * @category Format
 */
export function stringFormat(string: string, ...args: string[]){
    return string.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] !== 'undefined'
            ? args[number]
            : match;
    });
}

/**
 * @summary Deep Object Comparison
 * @description algorithm from {@link https://stackoverflow.com/questions/30476150/javascript-deep-comparison-recursively-objects-and-properties}
 * but with optional ignored properties
 *
 * @param {any} a
 * @param {any} b
 * @param {string} [propsToIgnore]
 *
 * @function isEqual
 * @memberOf module:decorator-validation.Utils.Equality
 * @category Validation
 */
export function isEqual(a: any, b: any,...propsToIgnore: string[]): boolean {
    if (a === b) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) return a === b;
    if (a === null || a === undefined || b === null || b === undefined) return false;
    if (typeof a !== typeof b) return false;
    if (a.prototype !== b.prototype) return false;
    let keys = Object.keys(a).filter(k => propsToIgnore.indexOf(k) === -1);
    if (keys.length !== Object.keys(b).filter(k => propsToIgnore.indexOf(k) === -1).length) return false;
    return keys.every(k => propsToIgnore.indexOf(k) !== -1 || isEqual(a[k], b[k], ...propsToIgnore));
}

/**
 * @summary Mimics Java's String's Hash implementation
 *
 * @param {string | number | symbol | Date} obj
 * @return {number} hash value of obj
 *
 * @function hashCode
 * @memberOf module:decorator-validation.Utils.Hashing
 * @category Hashing
 */
export function hashCode(obj: string | number | symbol | Date){
    obj = String(obj);
    let hash = 0;
    for (let i = 0; i < obj.length; i++) {
        let character = obj.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

/**
 * @summary Defines teh type for a Hashing function
 * @memberOf module:decorator-validation.Utils.Hashing
 * @category Hashing
 */
export type HashingFunction = (value: any) => string | number;


/**
 * @summary Hashes an object serializing it and then hashing the string
 * @description The Serialization algorithm used by default (JSON.stringify)
 * is not deterministic and should not be used for hashing
 *
 * @param {Record<string, any>} obj
 * @return {string} the resulting hash
 *
 * @function hashSerialization
 * @memberOf module:decorator-validation.Utils.Hashing
 *
 * @category Hashing
 */
export function hashSerialization(obj: Record<string, any> | any[]){
    return hashCode(Model.serialize(obj))
}

/**
 * @summary Hashes an object by combining the hash of all its properties
 *
 * @param {Record<string, any>} obj
 * @return {string} the resulting hash
 *
 * @function hashObj
 * @memberOf module:decorator-validation.Utils.Hashing
 * @category Hashing
 */
export function hashObj(obj: Record<string, any> | any[]){

    const hashReducer = function(h: number | string, el: any): string | number{
        const elHash = hashFunction(el);

        if (typeof elHash === "string")
            return hashFunction(((h as string) || "") + hashFunction(el))

        h = h || 0;
        h = (((h as number)<<5) -(h as number)) + elHash;
        return h & h;
    }

    const func: HashingFunction = hashCode;

    const hashFunction = function(value: any): string  | number{
        if (typeof value === 'undefined')
            return "";
        if (['string', 'number', 'symbol'].indexOf(typeof value) !== -1)
            return func(value.toString());
        if (value instanceof Date)
            return func(value.getTime());
        if (Array.isArray(value))
            return value.reduce(hashReducer, undefined);
        return (Object.values(value) as (string | number)[]).reduce(hashReducer, undefined as unknown as string| number);
    }

    const result = Object.values(obj).reduce(hashReducer, 0);

    return typeof result === 'number' ? Math.abs(result) : result;
}

/**
 * @summary For Serialization/deserialization purposes.
 * @description Reads the {@link ModelKeys.ANCHOR} property of a {@link Model} to discover the class to instantiate
 *
 * @function isModel
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function isModel(target: Record<string, any>){
    return !!target[ModelKeys.ANCHOR] || !!getClassDecorators(ModelKeys.REFLECT, target).find(dec => dec.key === ModelKeys.MODEL && dec.props && dec.props.class);
}

/**
 * @summary Util function to retrieve the Class decorators
 *
 * @function getClassDecorators
 * @memberOf module:decorator-validation.Reflection
 * @category Reflection
 */
export function getClassDecorators(annotationPrefix: string, target: any): {key: string, props: any}[] {

    const keys: any[] = Reflect.getOwnMetadataKeys(target.constructor);

    return keys.filter(key => key.toString().startsWith(annotationPrefix))
        .reduce((values, key) => {
            // get metadata value
            const currValues = {
                key: key.substring(annotationPrefix.length),
                props: Reflect.getMetadata(key, target.constructor)
            };
            return values.concat(currValues);
        }, []);
}

/**
 * @summary Util function to check a type according to a typeName
 *
 * @param {any} value
 * @param {string} acceptedType
 * @return {boolean} true for a match, false otherwise
 *
 * @function checkType
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function checkType(value: any, acceptedType: string){
    if (typeof value === acceptedType)
        return true;
    return value.constructor && value.constructor.name.toLowerCase() === acceptedType.toLowerCase()
}

/**
 * @summary Util function to check a type according multiple possibilities
 * @param {any} value
 * @param {string[]} acceptedTypes
 * @return {boolean} true if any is a match, false otherwise
 *
 * @function checkTypes
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function checkTypes(value: any, acceptedTypes: string[]){
    return !acceptedTypes.every(t => !checkType(value, t));
}

/**
 * @summary The model type
 *
 * @param {any} value
 * @param {string | string[] | {name: string}} types
 *
 * @function evaluateDesignTypes
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function evaluateDesignTypes(value: any, types: string | string[] | {name: string}){
    switch(typeof types){
        case 'string':
            return checkType(value, types);
        case "object":
            if (Array.isArray(types))
                return checkTypes(value, types);
            return true;
        case "function":
            if (types.name && types.name !== 'Object')
                return checkType(value, types.name);
            return true;
        default:
            return true;
    }
}

/**
 * @summary Reverses the process from {@link formatDate}
 *
 * @param {string} date the date string to be converted back into date
 * @param {string} format the date format
 * @return {Date} the date from the format or the standard new Date({@prop date}) if the string couldn't be parsed (are you sure the format matches the string?)
 *
 * @function dateFromFormat
 * @memberOf module:decorator-validation.Utils.Dates
 * @category Format
 */
export function dateFromFormat(date: string, format: string){
    let formatRegexp: string = format;

    // Hour
    if (formatRegexp.match(/hh/))
        formatRegexp = formatRegexp.replace("hh", "(?<hour>\\d{2})");
    else if (formatRegexp.match(/h/))
        formatRegexp = formatRegexp.replace("h", "(?<hour>\\d{1,2})");
    else if (formatRegexp.match(/HH/))
        formatRegexp = formatRegexp.replace("HH", "(?<hour>\\d{2})");
    else if (formatRegexp.match(/H/))
        formatRegexp = formatRegexp.replace("H", "(?<hour>\\d{1,2})");

    // Minutes
    if (formatRegexp.match(/mm/))
        formatRegexp = formatRegexp.replace("mm", "(?<minutes>\\d{2})");
    else if (formatRegexp.match(/m/))
        formatRegexp = formatRegexp.replace("m", "(?<minutes>\\d{1,2})");

    // Seconds
    if (formatRegexp.match(/ss/))
        formatRegexp = formatRegexp.replace("ss", "(?<seconds>\\d{2})");
    else if (formatRegexp.match(/s/))
        formatRegexp = formatRegexp.replace("s", "(?<seconds>\\d{1,2})");

    // Day
    if (formatRegexp.match(/dd/))
        formatRegexp = formatRegexp.replace("dd", "(?<day>\\d{2})");
    else if (formatRegexp.match(/d/))
        formatRegexp = formatRegexp.replace("d", "(?<day>\\d{1,2})");

    // Day Of Week
    if (formatRegexp.match(/EEEE/))
        formatRegexp = formatRegexp.replace("EEEE", "(?<dayofweek>\\w+)");
    else if (formatRegexp.match(/EEEE/))
        formatRegexp = formatRegexp.replace("EEE", "(?<dayofweek>\\w+)");

    // Year
    if (formatRegexp.match(/yyyy/))
        formatRegexp = formatRegexp.replace("yyyy", "(?<year>\\d{4})");
    else if (formatRegexp.match(/yy/))
        formatRegexp = formatRegexp.replace("yy", "(?<year>\\d{2})");

    // Month
    if (formatRegexp.match(/MMMM/))
        formatRegexp = formatRegexp.replace("MMMM", "(?<monthname>\\w+)");
    else if (formatRegexp.match(/MMM/))
        formatRegexp = formatRegexp.replace("MMM", "(?<monthnamesmall>\\w+)");
    if (formatRegexp.match(/MM/))
        formatRegexp = formatRegexp.replace("MM", "(?<month>\\d{2})");
    else if (formatRegexp.match(/M/))
        formatRegexp = formatRegexp.replace("M", "(?<month>\\d{1,2})");

    // Milis and Am Pm
    formatRegexp = formatRegexp.replace("S", "(?<milis>\\d{1,3})").replace('aaa', "(?<ampm>\\w{2})");

    const regexp = new RegExp(formatRegexp, 'g');

    const match: {groups: {
            year?: string,
            day?: string,
            ampm?: string,
            hour?: string,
            minutes?: string,
            seconds?: string,
            milis?: string,
            monthname?: string,
            monthnamesmall?: string,
            month?: string
        }} = regexp.exec(date) as any;

    if (!match || !match.groups)
        return new Date(date);

    const safeParseInt = function(n?: string){
        if (!n)
            return 0;
        const result = parseInt(n);

        return isNaN(result) ? 0 : result;
    }

    const year = safeParseInt(match.groups.year);
    const day = safeParseInt(match.groups.day);

    const amPm = match.groups.ampm;
    let hour = safeParseInt(match.groups.hour);

    if (amPm)
        hour = amPm === "PM" ? hour + 12 : hour;

    const minutes = safeParseInt(match.groups.minutes);
    const seconds = safeParseInt(match.groups.seconds);
    const ms = safeParseInt(match.groups.milis);


    const monthName = match.groups.monthname;
    const monthNameSmall = match.groups.monthnamesmall;
    let month: number | string = match.groups.month as string;
    if (monthName)
        month = MONTH_NAMES.indexOf(monthName)
    else if (monthNameSmall){
        const m = MONTH_NAMES.find(m => m.toLowerCase().startsWith(monthNameSmall.toLowerCase()))
        if (!m)
            return new Date(date);
        month = MONTH_NAMES.indexOf(m);
    } else
        month = safeParseInt(`${month}`);

    return new Date(year, month - 1, day, hour, minutes, seconds, ms);
}