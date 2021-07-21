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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Model_1 = __importDefault(require("../src/Model/Model"));
var decorators_1 = require("../src/validation/decorators");
var TestModel = (function (_super) {
    __extends(TestModel, _super);
    function TestModel(model) {
        var _this = _super.call(this, model) || this;
        _this.id = undefined;
        _this.prop1 = undefined;
        _this.prop2 = undefined;
        _this.prop3 = undefined;
        _this.prop4 = undefined;
        _this.prop5 = undefined;
        Model_1.default.constructFromObject(_this, model);
        return _this;
    }
    __decorate([
        decorators_1.required(),
        __metadata("design:type", Object)
    ], TestModel.prototype, "id", void 0);
    __decorate([
        decorators_1.required(),
        decorators_1.max(100),
        decorators_1.min(0),
        __metadata("design:type", Number)
    ], TestModel.prototype, "prop1", void 0);
    __decorate([
        decorators_1.maxlength(10),
        decorators_1.minlength(5),
        __metadata("design:type", String)
    ], TestModel.prototype, "prop2", void 0);
    __decorate([
        decorators_1.pattern(/^\w+$/g),
        __metadata("design:type", String)
    ], TestModel.prototype, "prop3", void 0);
    __decorate([
        decorators_1.email(),
        __metadata("design:type", String)
    ], TestModel.prototype, "prop4", void 0);
    __decorate([
        decorators_1.pattern("^\\w+$"),
        __metadata("design:type", String)
    ], TestModel.prototype, "prop5", void 0);
    return TestModel;
}(Model_1.default));
describe('Model Test', function () {
    it('Create with required properties as undefined', function () {
        var empty = new TestModel();
        var keys = Object.keys(empty);
        expect(keys.length).toBe(6);
    });
    it('Create & Equality', function () {
        var dm = new TestModel({
            id: 'id',
            prop1: 23,
            prop2: "tests",
            prop3: "asdasfsdfsda",
            prop4: "test@pdm.com"
        });
        var dm2 = new TestModel(dm);
        var equality = dm.equals(dm2);
        var reverseEquality = dm2.equals(dm);
        var identity = dm === dm2;
        expect(equality).toBe(true);
        expect(reverseEquality).toBe(true);
        expect(identity).toBe(false);
    });
});
describe('Validation by decorators test', function () {
    it('Success Validation', function () {
        var dm = new TestModel({
            id: 'id',
            prop1: 23,
            prop2: "tests",
            prop3: "asdasfsdfsda",
            prop4: "test@pdm.com",
            prop5: "asdasdasd"
        });
        var errors = dm.hasErrors();
        expect(errors).toBeUndefined();
    });
    it('Failure Validation', function () {
        var dm = new TestModel({
            prop1: 237,
            prop2: "te",
            prop3: "asdasfsdf  sda",
            prop4: "asdasfsdf  sda",
            prop5: "asdasfsdf  sda"
        });
        var errors = dm.hasErrors();
        expect(errors).toBeDefined();
        expect(errors).toBeInstanceOf(Array);
        expect(errors && errors.length).toBe(6);
    });
});
