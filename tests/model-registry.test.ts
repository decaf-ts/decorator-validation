import {model} from "../src";
import Model from "../src/Model/Model";
import ModelRegistry from "../src/Model/Registry";
import {ModelKeys} from "../lib";

@model()
class TestModel extends Model {

    name?: string = undefined;

    constructor(model?: TestModel | {}){
        super(model);
        Model.constructFromObject<TestModel>(this, model);
    }
}

describe('Model Registry', () => {

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