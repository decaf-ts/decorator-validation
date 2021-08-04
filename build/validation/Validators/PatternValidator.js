"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Validator_1 = __importDefault(require("./Validator"));
var constants_1 = require("../constants");
var PatternValidator = (function (_super) {
    __extends(PatternValidator, _super);
    function PatternValidator(key, message) {
        if (key === void 0) { key = constants_1.ValidationKeys.PATTERN; }
        if (message === void 0) { message = constants_1.DEFAULT_ERROR_MESSAGES.PATTERN; }
        return _super.call(this, key, message) || this;
    }
    PatternValidator.prototype.getPattern = function (pattern) {
        if (!PatternValidator.regexpParser.test(pattern))
            return new RegExp(pattern);
        var match = pattern.match(PatternValidator.regexpParser);
        return new RegExp(match[1], match[2]);
    };
    PatternValidator.prototype.hasErrors = function (value, pattern, message) {
        if (!value)
            return;
        pattern = typeof pattern === 'string' ? this.getPattern(pattern) : pattern;
        return !pattern.test(value) ? this.getMessage(message || this.message) : undefined;
    };
    PatternValidator.regexpParser = new RegExp("^\/(.+)\/([gimus]*)$");
    return PatternValidator;
}(Validator_1.default));
exports.default = PatternValidator;
//# sourceMappingURL=PatternValidator.js.map