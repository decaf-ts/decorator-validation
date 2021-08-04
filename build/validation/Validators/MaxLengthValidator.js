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
var MaxLengthValidator = (function (_super) {
    __extends(MaxLengthValidator, _super);
    function MaxLengthValidator(message) {
        if (message === void 0) { message = constants_1.DEFAULT_ERROR_MESSAGES.MAX_LENGTH; }
        return _super.call(this, constants_1.ValidationKeys.MAX_LENGTH, message) || this;
    }
    MaxLengthValidator.prototype.hasErrors = function (value, maxlength, message) {
        if (value === undefined)
            return;
        return value.length > maxlength ? this.getMessage(message || this.message, maxlength) : undefined;
    };
    return MaxLengthValidator;
}(Validator_1.default));
exports.default = MaxLengthValidator;
//# sourceMappingURL=MaxLengthValidator.js.map