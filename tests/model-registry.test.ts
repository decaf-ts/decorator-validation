import {constructFromObject, getModelRegistry, model} from "../src";
import {Model} from "../src/model/Model";
import {ModelKeys} from "../src/model/constants";

@model()
class TestModel extends Model {

    name?: string = undefined;

    constructor(model?: TestModel | {}){
        super(model);
        constructFromObject<TestModel>(this, model);
    }
}

describe('Model Registry', () => {

    const modelRegistry = getModelRegistry();

    it('Handles missing arguments properly', () => {

        // @ts-ignore
        expect(() => modelRegistry.register(undefined, "random stuff, not a constructor")).toThrowError(`Model registering failed. Missing Class name or constructor`);
        expect(() => modelRegistry.register('name', undefined)).toThrowError(`Model registering failed. Missing Class name or constructor`);
        expect(() => modelRegistry.build({})).toThrowError(`Provided obj is not a Model object`);
    })

    it("Defines the correct information", () => {

        const mockRegister = jest.spyOn(modelRegistry, 'register');

        const tm = new TestModel();

        const rebuiltTm = modelRegistry.build(JSON.parse(JSON.stringify(tm)));

        expect(tm.equals(rebuiltTm)).toBe(true);
        expect(tm === rebuiltTm).toBe(false);
        expect(tm.prototype).toBe(rebuiltTm.prototype);
        expect(rebuiltTm[ModelKeys.ANCHOR]).toBeDefined();
        expect(mockRegister).toBeCalledTimes(2);

    })
})