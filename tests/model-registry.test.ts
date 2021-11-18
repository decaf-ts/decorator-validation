import {constructFromObject, model} from "../src";
import Model from "../src/Model/Model";
import ModelRegistry from "../src/Model/Registry";
import {ModelKeys} from "../src/Model/constants";

@model()
class TestModel extends Model {

    name?: string = undefined;

    constructor(model?: TestModel | {}){
        super(model);
        constructFromObject<TestModel>(this, model);
    }
}

describe('Model Registry', () => {

    it('Handles missing arguments properly', () => {
        // @ts-ignore
        expect(() => ModelRegistry.register(undefined, "random stuff, not a constructor")).toThrowError(`Model registering failed. Missing Class name or constructor`);
        expect(() => ModelRegistry.register('name', undefined)).toThrowError(`Model registering failed. Missing Class name or constructor`);
        expect(() => ModelRegistry.build()).toThrowError(`Provided obj is not a Model object`);
    })

    it("Defines the correct information", () => {

        const mockRegister = jest.spyOn(ModelRegistry, 'register');

        const tm = new TestModel();

        const rebuiltTm = ModelRegistry.build(JSON.parse(JSON.stringify(tm)));

        expect(tm.equals(rebuiltTm)).toBe(true);
        expect(tm === rebuiltTm).toBe(false);
        expect(tm.prototype).toBe(rebuiltTm.prototype);
        expect(rebuiltTm[ModelKeys.ANCHOR]).toBeDefined();
        expect(mockRegister).toBeCalledTimes(2);

    })
})