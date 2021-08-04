"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
var validation_1 = require("../validation");
var utils_1 = require("../utils");
var Model = (function () {
    function Model(model) {
        Model.constructFromObject(this, model);
    }
    Model.prototype.hasErrors = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return validation_1.validate(this);
    };
    Model.prototype.equals = function (obj) {
        var exceptions = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            exceptions[_i - 1] = arguments[_i];
        }
        return utils_1.isEqual.apply(void 0, __spreadArray([this, obj], exceptions));
    };
    Model.constructFromObject = function (self, obj) {
        for (var prop in obj)
            if (obj.hasOwnProperty(prop) && self.hasOwnProperty(prop))
                self[prop] = obj[prop];
        return self;
    };
    return Model;
}());
exports.default = Model;
//# sourceMappingURL=Model.js.map