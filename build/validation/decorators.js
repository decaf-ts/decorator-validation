"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.url = exports.email = exports.pattern = exports.maxlength = exports.minlength = exports.max = exports.min = exports.required = exports.getValidationKey = void 0;
require("reflect-metadata");
var constants_1 = require("./constants");
var getValidationKey = function (key) { return constants_1.ValidationKeys.REFLECT + key; };
exports.getValidationKey = getValidationKey;
var required = function (message) {
    if (message === void 0) { message = constants_1.DEFAULT_ERROR_MESSAGES.REQUIRED; }
    return function (target, propertyKey) {
        Reflect.defineMetadata(exports.getValidationKey(constants_1.ValidationKeys.REQUIRED), {
            message: message
        }, target, propertyKey);
    };
};
exports.required = required;
var min = function (value, message) {
    if (message === void 0) { message = constants_1.DEFAULT_ERROR_MESSAGES.MIN; }
    return function (target, propertyKey) {
        Reflect.defineMetadata(exports.getValidationKey(constants_1.ValidationKeys.MIN), {
            value: value,
            message: message
        }, target, propertyKey);
    };
};
exports.min = min;
var max = function (value, message) {
    if (message === void 0) { message = constants_1.DEFAULT_ERROR_MESSAGES.MAX; }
    return function (target, propertyKey) {
        Reflect.defineMetadata(exports.getValidationKey(constants_1.ValidationKeys.MAX), {
            value: value,
            message: message
        }, target, propertyKey);
    };
};
exports.max = max;
var minlength = function (value, message) {
    if (message === void 0) { message = constants_1.DEFAULT_ERROR_MESSAGES.MIN_LENGTH; }
    return function (target, propertyKey) {
        Reflect.defineMetadata(exports.getValidationKey(constants_1.ValidationKeys.MIN_LENGTH), {
            value: value,
            message: message
        }, target, propertyKey);
    };
};
exports.minlength = minlength;
var maxlength = function (value, message) {
    if (message === void 0) { message = constants_1.DEFAULT_ERROR_MESSAGES.MAX_LENGTH; }
    return function (target, propertyKey) {
        Reflect.defineMetadata(exports.getValidationKey(constants_1.ValidationKeys.MAX_LENGTH), {
            value: value,
            message: message
        }, target, propertyKey);
    };
};
exports.maxlength = maxlength;
var pattern = function (value, message) {
    if (message === void 0) { message = constants_1.DEFAULT_ERROR_MESSAGES.PATTERN; }
    return function (target, propertyKey) {
        Reflect.defineMetadata(exports.getValidationKey(constants_1.ValidationKeys.PATTERN), {
            value: typeof value === 'string' ? value : value.toString(),
            message: message
        }, target, propertyKey);
    };
};
exports.pattern = pattern;
var email = function (message) {
    if (message === void 0) { message = constants_1.DEFAULT_ERROR_MESSAGES.EMAIL; }
    return function (target, propertyKey) {
        Reflect.defineMetadata(exports.getValidationKey(constants_1.ValidationKeys.EMAIL), {
            message: message
        }, target, propertyKey);
    };
};
exports.email = email;
var url = function (message) {
    if (message === void 0) { message = constants_1.DEFAULT_ERROR_MESSAGES.URL; }
    return function (target, propertyKey) {
        Reflect.defineMetadata(exports.getValidationKey(constants_1.ValidationKeys.URL), {
            message: message
        }, target, propertyKey);
    };
};
exports.url = url;
//# sourceMappingURL=decorators.js.map