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
 * @prop {string} annotationPrefix
 * @prop {any} target
 * @prop {string | symbol} propertyName
 * @prop {boolean} [ignoreType] defaults to false. decides if the {@link ModelKeys.TYPE} is ignored or not
 * @function getPropertyDecorators
 * @memberOf utils
 */
export function getPropertyDecorators(annotationPrefix: string, target: any, propertyName: string | symbol, ignoreType: boolean = false): {prop: string | symbol, decorators: []} {
    // get info about keys that used in current property
    const keys: any[] = Reflect.getMetadataKeys(target, propertyName);
    const decorators = keys
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
 * @return {number} hash value of obj
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
    if (value.constructor && value.constructor.name.toLowerCase() === acceptedType.toLowerCase())
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
                return checkType(value, types.name.toLowerCase());
            return true;
        default:
            return true;
    }
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

/**
 * Reverses the process from {@link formatDate}
 *
 * @param {string} date the date string to be converted back into date
 * @param {string} format the date format
 * @return {Date} the date from the format or the standard new Date({@prop date}) if the string couldn't be parsed (are you sure the format matches the string?)
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

    const match = regexp.exec(date);

    if (!match || !match.groups)
        return new Date(date);

    const year = parseInt(match.groups.year);
    const day = parseInt(match.groups.day);

    const amPm = match.groups.ampm;
    let hour = parseInt(match.groups.hour);

    if (amPm)
        hour = amPm === "PM" ? hour + 12 : hour;

    const minutes = parseInt(match.groups.minutes);
    const seconds = parseInt(match.groups.seconds);
    const ms = parseInt(match.groups.milis);


    const monthName = match.groups.monthname;
    const monthNameSmall = match.groups.monthnamesmall;
    let month: number | string = match.groups.month;
    if (monthName)
        month = MONTH_NAMES.indexOf(monthName)
    else if (monthNameSmall){
        const m = MONTH_NAMES.find(m => m.toLowerCase().startsWith(monthNameSmall.toLowerCase()))
        if (!m)
            return new Date(date);
        month = MONTH_NAMES.indexOf(m);
    } else
        month = parseInt(month);

    return new Date(year, month - 1, day, hour, minutes, seconds, ms);
}

export function twoDigitPad(num: number): string {
    return num < 10 ? "0" + num : num.toString();
}

/**
 * repopulates the Object properties with the ones from the new object
 *
 * @param {T} self
 * @param {T| {}} obj
 * @function constructFromObject
 * @memberOf utils
 */
export function constructFromObject<T extends Model>(self: T, obj?: T | {}){
    if (!obj)
        return;
    for (let prop in obj)
        if(obj.hasOwnProperty(prop) && (self.hasOwnProperty(prop) || (self.prototype && self.prototype.hasOwnProperty(prop))))// @ts-ignore
            self[prop] = obj[prop];
    return self;
}