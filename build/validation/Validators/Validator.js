"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../../utils");
var constants_1 = require("../constants");
var Validator = (function () {
    function Validator(validationKey, message) {
        if (message === void 0) { message = constants_1.DEFAULT_ERROR_MESSAGES.DEFAULT; }
        this.validationKey = validationKey;
        this.message = message;
    }
    Validator.prototype.getMessage = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return utils_1.stringFormat.apply(void 0, __spreadArray([message], args));
    };
    return Validator;
}());
exports.default = Validator;
//# sourceMappingURL=Validator.js.map