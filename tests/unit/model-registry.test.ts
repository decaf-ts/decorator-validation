import {model, Model, ModelKeys} from "../../src";

@model()
class TestModel extends Model {

    name?: string = undefined;

    constructor(model?: TestModel | {}){
        super(model);
        Model.fromObject<TestModel>(this, model);
    }
}



describe('Model Registry', () => {

    afterAll(() => {
        jest.restoreAllMocks();
        jest.resetAllMocks()
    })

    it('Handles missing arguments properly', () => {

        // @ts-ignore
        expect(() => Model.register("random stuff, not a constructor")).toThrowError(`Model registering failed. Missing Class name or constructor`);
        // @ts-ignore
        expect(() => Model.register(undefined, "some name")).toThrowError(`Model registering failed. Missing Class name or constructor`);
        expect(() => Model.build({})).toThrowError(`Provided obj is not a Model object`);
    })

    it("Defines the correct information", () => {
        const tm = new TestModel();

        const serialization = tm.serialize();
        const rebuiltTm = Model.deserialize(serialization);

        expect(tm.equals(rebuiltTm)).toBe(true);
        expect(tm === rebuiltTm).toBe(false);
        expect(tm.prototype).toBe(rebuiltTm.prototype);
        expect(rebuiltTm[ModelKeys.ANCHOR]).toBeDefined();

    })
})