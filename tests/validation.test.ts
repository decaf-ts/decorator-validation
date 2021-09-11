import Model from "../src/Model/Model";
import {Decorators, step, ValidationKeys} from '../src';
import {Validators} from '../src';
import Validator from "../src/validation/Validators/Validator";
const {email, max, maxlength, min, minlength, pattern, required, url, type} = Decorators;

class InnerTestModel {

}

class TestModel extends Model {

    @type(['string', 'number'])
    @required()
    id?: string | number = undefined;

    irrelevant?: string = undefined;

    @required()
    @max(100)
    @step(5)
    @min(0)
    prop1?: number = undefined;

    @maxlength(10)
    @minlength(5)
    prop2?: string = undefined;

    @pattern(/^\w+$/g)
    prop3?: string = undefined;

    @email()
    prop4?: string = undefined;

    @pattern("^\\w+$")
    prop5?: string = undefined;

    @url()
    prop6?: string = undefined;

    @type(InnerTestModel.name)
    prop7?: typeof InnerTestModel = undefined;


    prop9?: Date = undefined;

    constructor(model?: TestModel | {}){
        super(model);
        Model.constructFromObject<TestModel>(this, model);
    }
}

describe('Model Test', function() {

    it('Create with required properties as undefined', function() {
        const empty = new TestModel();
        const keys = Object.keys(empty);
        expect(keys.length).toBe(10);
    });

    it('outputs to string nicely', function() {
        const dm = new TestModel({
            id: 'id',
            prop1: 23,
            prop2: "tests",
            prop3: "asdasfsdfsda",
            prop4: "test@pdm.com"
        });

        const output = dm.toString();
        expect(output).toBe("TestModel: {\n" +
            "  \"id\": \"id\",\n" +
            "  \"prop1\": 23,\n" +
            "  \"prop2\": \"tests\",\n" +
            "  \"prop3\": \"asdasfsdfsda\",\n" +
            "  \"prop4\": \"test@pdm.com\"\n" +
            "}");});

    it('Create & Equality & Hash', function() {
        const dm = new TestModel({
            id: 'id',
            prop1: 23,
            prop2: "tests",
            prop3: "asdasfsdfsda",
            prop4: "test@pdm.com"
        });

        const dm2 = new TestModel(dm);
        const equality = dm.equals(dm2);
        const reverseEquality = dm2.equals(dm);
        const identity = dm === dm2;
        expect(equality).toBe(true);
        expect(dm.toHash()).toEqual(dm2.toHash());
        expect(reverseEquality).toBe(true);
        expect(identity).toBe(false)
    });
});

describe('Validation by decorators test', function() {
    it('Success Validation', function() {
        const dm = new TestModel({
            id: 'id',
            prop1: 25,
            prop2: "tests",
            prop3: "asdasfsdfsda",
            prop4: "test@pdm.com",
            prop5: "asdasdasd",
            prop6: "http://www.thisisatest.com",
            prop7: new InnerTestModel()
        });

        const errors = dm.hasErrors();
        expect(errors).toBeUndefined();
    });

    it('Failure Validation', function() {

        const dm = new TestModel({
            prop1: 237,
            prop2: "te",
            prop3: "asdasfsdf  sda",
            prop4: "asdasfsdf  sda",
            prop5: "asdasfsdf  sda",
            prop6: "asdasfsdf  sda"
        });

        const errors = dm.hasErrors();
        expect(errors).toBeDefined();
        if (errors){
            expect(Object.keys(errors)).toBeInstanceOf(Array);
            expect(errors && Object.values(errors).length).toBe(7);
            expect(errors.toString()).toBe("This field is required\nInvalid Value. Not a step of 5\nThe maximum value is 100\n" +
                "The minimum length is 5\nThe value does not match the pattern\n" +
                "The value is not a valid email\nThe value does not match the pattern\nThe value is not a valid URL");
        }
    });

    it('Pass with non required undefined values', function() {

        const dm = new TestModel({
            prop1: 235
        });

        const errors = dm.hasErrors();
        expect(errors).toBeDefined();
        if (errors){
            expect(Object.keys(errors)).toBeInstanceOf(Array);
            expect(errors && Object.keys(errors).length).toBe(2);
            expect(errors.toString()).toBe("This field is required\nThe maximum value is 100");
        }

    });

    it('Test all non required Validators for undefined values pass', function() {
        Object.values(Validators).filter(v => v.default.name !== 'Validator').forEach(v => {
            // @ts-ignore
            const validator: Validator = new (v.default)();
            if (validator.validationKey === ValidationKeys.REQUIRED)
                return;
            expect(validator.hasErrors(undefined)).toBeUndefined();
        })
    });
});