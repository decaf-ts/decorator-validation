"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.ValidatorRegistry = void 0;
var utils_1 = require("../utils");
var Validators = __importStar(require("./Validators"));
var constants_1 = require("./constants");
var Validator_1 = __importDefault(require("./Validators/Validator"));
function ValRegistry() {
    var initial = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        initial[_i] = arguments[_i];
    }
    var registry = new function () {
        var cache = {};
        var self = this;
        self.register = function () {
            var validator = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                validator[_i] = arguments[_i];
            }
            validator.forEach(function (v) {
                if (v instanceof Validator_1.default) {
                    cache[v.validationKey] = v;
                }
                else {
                    var constructorMethod = v.default || v;
                    var instance = new constructorMethod();
                    cache[instance.validationKey] = instance;
                }
            });
        };
        self.getValidator = function (validatorKey) {
            if (!(validatorKey in cache))
                return;
            return cache[validatorKey];
        };
    }();
    registry.register.apply(registry, initial);
    return registry;
}
exports.ValidatorRegistry = ValRegistry.apply(void 0, Object.values(Validators));
function validate(obj) {
    var decoratedProperties = [];
    for (var prop in obj)
        if (obj.hasOwnProperty(prop))
            decoratedProperties.push(utils_1.getPropertyDecorators(constants_1.ValidationKeys.REFLECT, obj, prop));
    return decoratedProperties.reduce(function (accum, decoratedProperty) {
        var prop = decoratedProperty.prop, decorators = decoratedProperty.decorators;
        if (!decorators || !decorators.length)
            return accum;
        var errs = decorators.reduce(function (acc, decorator) {
            var validator = exports.ValidatorRegistry.getValidator(decorator.key);
            if (!validator) {
                throw new Error("Could not find Matching validator for " + decorator.key + " for property " + String(decoratedProperty.prop));
            }
            var err = validator.hasErrors.apply(validator, __spreadArray([obj[prop]], Object.values(decorator.props)));
            if (err) {
                acc = acc || {};
                acc[decorator.key] = err;
            }
            return acc;
        }, undefined);
        if (errs) {
            var propErrors = {
                property: decoratedProperty.prop,
                errors: errs
            };
            accum = accum || [];
            accum.push(propErrors);
        }
        return accum;
    }, undefined);
}
exports.validate = validate;
//# sourceMappingURL=validation.js.map