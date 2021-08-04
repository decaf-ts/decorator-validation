"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqual = exports.stringFormat = exports.getPropertyDecorators = void 0;
function getPropertyDecorators(annotationPrefix, target, propertyName) {
    var keys = Reflect.getMetadataKeys(target, propertyName);
    var decorators = keys
        .filter(function (key) { return key.toString().startsWith(annotationPrefix); })
        .reduce(function (values, key) {
        var currValues = {
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
exports.getPropertyDecorators = getPropertyDecorators;
function stringFormat(string) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return string.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] !== 'undefined'
            ? args[number]
            : match;
    });
}
exports.stringFormat = stringFormat;
function isEqual(a, b) {
    var propsToIgnore = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        propsToIgnore[_i - 2] = arguments[_i];
    }
    if (a === b)
        return true;
    if (a instanceof Date && b instanceof Date)
        return a.getTime() === b.getTime();
    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object'))
        return a === b;
    if (a === null || a === undefined || b === null || b === undefined)
        return false;
    if (a.prototype !== b.prototype)
        return false;
    var keys = Object.keys(a).filter(function (k) { return propsToIgnore.indexOf(k) === -1; });
    if (keys.length !== Object.keys(b).filter(function (k) { return propsToIgnore.indexOf(k) === -1; }).length)
        return false;
    return keys.every(function (k) { return propsToIgnore.indexOf(k) !== -1 || isEqual.apply(void 0, __spreadArray([a[k], b[k]], propsToIgnore)); });
}
exports.isEqual = isEqual;
//# sourceMappingURL=utils.js.map