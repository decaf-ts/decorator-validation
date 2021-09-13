/**
 * @namespace utils
 * @memberOf decorator-validation
 */

import Model from "../Model/Model";
import {ModelKeys} from "../Model/constants";
import {MONTH_NAMES, DAYS_OF_WEEK_NAMES} from "./constants";

/**
 * Util function to retrieve the decorators for the provided Property
 *
 * @function getPropertyDecorators
 * @memberOf utils
 */
export function getPropertyDecorators(annotationPrefix: string, target: any, propertyName: string | symbol): {prop: string | symbol, decorators: []} {
    // get info about keys that used in current property
    const keys: any[] = Reflect.getMetadataKeys(target, propertyName);
    const decorators = keys
        // filter your custom decorators
        .filter(key => key === ModelKeys.TYPE || key.toString().startsWith(annotationPrefix))
        .reduce((values, key) => {
            // get metadata value.
            const currValues = {
                key: key.substring(annotationPrefix.length) || key,
                props: Reflect.getMetadata(key, target, propertyName)
            };
            return values.concat(currValues);
        }, []);

    return {
        prop: propertyName,
        decorators: decorators
    };
}

/**
 * Util function to provide string format functionality similar to C#'s string.format
 *
 * @param {string} string
 * @param {string} args replacements made by order of appearance (replacement0 wil replace {0} and so on)
 * @return {string} formatted string
 * @function stringFormat
 * @memberOf utils
 */
export function stringFormat(string: string, ...args: string[]){
    return string.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] !== 'undefined'
            ? args[number]
            : match;
    });
}

/**
 * Deep Object Comparison
 * https://stackoverflow.com/questions/30476150/javascript-deep-comparison-recursively-objects-and-properties
 *
 * with optional ignored properties
 *
 * @param {{}} a
 * @param {{}} b
 * @param {string} [propsToIgnore]
 * @return {boolean}
 * @function isEqual
 * @memberOf utils
 */
export function isEqual(a: any, b: any,...propsToIgnore: string[]): boolean {
    if (a === b) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) return a === b;
    if (a === null || a === undefined || b === null || b === undefined) return false;
    if (a.prototype !== b.prototype) return false;
    let keys = Object.keys(a).filter(k => propsToIgnore.indexOf(k) === -1);
    if (keys.length !== Object.keys(b).filter(k => propsToIgnore.indexOf(k) === -1).length) return false;
    return keys.every(k => propsToIgnore.indexOf(k) !== -1 || isEqual(a[k], b[k], ...propsToIgnore));
}

/**
 * Mimicks Java's String's Hash implementation
 * @param {string | number | symbol | Date} obj
 */
export function hashCode(obj: string | number | symbol | Date){
    obj = String(obj);
    var hash = 0;
    for (var i = 0; i < obj.length; i++) {
        var character = obj.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

export function hashObj(obj: {} | []){

    const hashReducer = function(h: number, el: any){
        h = ((h<<5) -h) + hashFunction(el);
        return h & h;
    }

    const hashFunction = function(value: any){
        if (typeof value === 'undefined')
            return 0;
        if (['string', 'number', 'symbol'].indexOf(typeof value) !== -1)
            return hashCode(value.toString());
        if (value instanceof Date)
            return hashCode(value.getTime());
        if (Array.isArray(value))
            return value.reduce(hashReducer, 0);
        return Object.values(value).reduce(hashReducer, 0)
    }

    return Math.abs(Object.values(obj).reduce(hashReducer, 0));
}

/**
 * Helper Function to override constructors
 * @param {Function} constructor
 * @param {any[]} args
 * @return {T} the new instance
 */
export function construct<T extends Model>(constructor: any, ...args: any[]) {
    const _constr = (...argz: any[]) => new constructor(...argz);
    _constr.prototype = constructor.prototype;
    return _constr(...args);
}

export function isModel(target: {[indexer: string]: any}){
    return !!target[ModelKeys.ANCHOR] || !!getClassDecorators(ModelKeys.REFLECT, target).find(dec => dec.key === ModelKeys.MODEL && dec.props && dec.props.class);
}

/**
 * Util function to retrieve the decorators for the provided Property
 *
 * @function getPropertyDecorators
 * @memberOf utils
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
 * Util function to check a type according to a typeName
 * @param {any} value
 * @param {string} acceptedType
 * @return {boolean} true for a match, false otherwise
 */
export function checkType(value: any, acceptedType: string){
    if (typeof value === acceptedType)
        return true;
    if (value.constructor && value.constructor.name === acceptedType)
        return true;
    return false;
}

/**
 * Util function to check a type according multiple possibilities
 * @param {any} value
 * @param {string[]} acceptedTypes
 * @return {boolean} true if any is a match, false otherwise
 */
export function checkTypes(value: any, acceptedTypes: string[]){
    return !acceptedTypes.every(t => !checkType(value, t));
}

/**
 * Date Format Handling
 * https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
 *
 * <pre>
 *      Using similar formatting as Moment.js, Class DateTimeFormatter (Java), and Class SimpleDateFormat (Java),
 *      I implemented a comprehensive solution formatDate(date, patternStr) where the code is easy to read and modify.
 *      You can display date, time, AM/PM, etc.
 *
 *      Date and Time Patterns
 *      yy = 2-digit year; yyyy = full year
 *      M = digit month; MM = 2-digit month; MMM = short month name; MMMM = full month name
 *      EEEE = full weekday name; EEE = short weekday name
 *      d = digit day; dd = 2-digit day
 *      h = hours am/pm; hh = 2-digit hours am/pm; H = hours; HH = 2-digit hours
 *      m = minutes; mm = 2-digit minutes; aaa = AM/PM
 *      s = seconds; ss = 2-digit seconds
 *      S = miliseconds
 * </pre>
 */
export function formatDate(date: Date, patternStr: string = 'yyyy/MM/dd'){
    const day: number = date.getDate(),
        month: number = date.getMonth(),
        year: number = date.getFullYear(),
        hour: number = date.getHours(),
        minute: number = date.getMinutes(),
        second: number = date.getSeconds(),
        miliseconds: number = date.getMilliseconds(),
        h: number = hour % 12,
        hh: string = twoDigitPad(h),
        HH: string = twoDigitPad(hour),
        mm: string = twoDigitPad(minute),
        ss: string = twoDigitPad(second),
        aaa: string = hour < 12 ? 'AM' : 'PM',
        EEEE: string = DAYS_OF_WEEK_NAMES[date.getDay()],
        EEE: string = EEEE.substr(0, 3),
        dd: string = twoDigitPad(day),
        M: number = month + 1,
        MM: string = twoDigitPad(M),
        MMMM: string = MONTH_NAMES[month],
        MMM : string= MMMM.substr(0, 3),
        yyyy: string = year + "",
        yy: string = yyyy.substr(2, 2)
    ;
    // checks to see if month name will be used
    patternStr = patternStr
        .replace('hh', hh).replace('h', h.toString())
        .replace('HH', HH).replace('H', hour.toString())
        .replace('mm', mm).replace('m', minute.toString())
        .replace('ss', ss).replace('s', second.toString())
        .replace('S', miliseconds.toString())
        .replace('dd', dd).replace('d', day.toString())

        .replace('EEEE', EEEE).replace('EEE', EEE)
        .replace('yyyy', yyyy)
        .replace('yy', yy)
        .replace('aaa', aaa);
    if (patternStr.indexOf('MMM') > -1) {
        patternStr = patternStr
            .replace('MMMM', MMMM)
            .replace('MMM', MMM);
    }
    else {
        patternStr = patternStr
            .replace('MM', MM)
            .replace('M', M.toString());
    }
    return patternStr;
}

function twoDigitPad(num: number): string {
    return num < 10 ? "0" + num : num.toString();
}