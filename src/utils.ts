/**
 * @namespace utils
 * @memberOf decorator-validation
 */

/**
 * @typedef Err
 */
export type Err = Error | string | undefined

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
        .filter(key => key.toString().startsWith(annotationPrefix))
        .reduce((values, key) => {
            // get metadata value.
            const currValues = {
                key: key.substring(annotationPrefix.length),
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