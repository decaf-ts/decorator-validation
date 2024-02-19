import {constructFromObject, isModel, model, Model} from "../../src";
import {HashingFunction, setHashingFunction} from "../../src";
import {getHashingFunction} from "../../src";

@model()
class TestModel extends Model {

    name?: string = undefined;

    constructor(model?: TestModel | {}){
        super(model);
        constructFromObject<TestModel>(this, model);
    }
}

describe('Hashing methods', function() {
    it('hashes a string', function() {
        const testString = "this is test string";
        const h = getHashingFunction()(testString);
        expect(h).toBe(1579028267);
    });

    it('hashes an object', () => {
        const d = new Date(Date.UTC(2021,1,1));
        const dummyObj = {key: 1};
        const dummyArr = [1, 5];
        const otherDummyArr = [
            dummyObj,
            1,
            "test",
            dummyArr
        ];
        const obj = {
            name: 'name',
            number: 10,
            date: d,
            arr: otherDummyArr
        }

        const h = getHashingFunction()(obj);

        expect(h).toBe(1603681539);
    });

    it("can use other hashing mechanisms", () => {
        const func: HashingFunction = (obj: any) => {
            return "AAAA"
        };

        setHashingFunction(func);

        const d = new Date(Date.UTC(2021,1,1));
        const dummyObj = {key: 1};
        const dummyArr = [1, 5];
        const otherDummyArr = [
            dummyObj,
            1,
            "test",
            dummyArr
        ];
        const obj = {
            name: 'name',
            number: 10,
            date: d,
            arr: otherDummyArr
        }

        const h = getHashingFunction()(obj);
        expect(typeof h).toBe("string")
        expect(h).toBe("AAAA");
    })
});

describe('Model Verification', function() {

    it('Fails to Detects a model for normal serialization', function() {
        const tm = new TestModel();
        expect(isModel(tm)).toBe(true);
        expect(isModel(JSON.parse(JSON.stringify(tm)))).toBe(false);
    });

    it('Detects a model when properly serialized', function() {
        const tm = new TestModel();
        expect(isModel(tm)).toBe(true);
        expect(isModel(Model.deserialize(tm.serialize()))).toBe(true);
        expect(isModel({})).toBe(false);
    });
});