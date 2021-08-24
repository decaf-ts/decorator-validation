import {model} from "../src";
import Model from "../src/Model/Model";
import {ModelKeys} from "../src";
import {getClassDecorators} from "../src";
import ModelRegistry from "../src/Model/Registry";

@model()
class TestModel extends Model {

    name?: string = undefined;

    constructor(model?: TestModel | {}){
        super(model);
        Model.constructFromObject<TestModel>(this, model);
    }
}

describe('Class Decorators', () => {

    it('Defines the anchor property', () => {
        const tm = new TestModel();
        expect(tm[ModelKeys.ANCHOR]).toBeDefined();
        expect(typeof tm[ModelKeys.ANCHOR]).toEqual('object');
        expect(tm[ModelKeys.ANCHOR].class).toEqual(tm.constructor.name);
    })

    it ("Emits Metadata", () => {
        const tm = new TestModel();
        const decorators = getClassDecorators(ModelKeys.REFLECT, tm);
        expect(decorators.length).toBe(1);
        expect(decorators[0].key).toBe(ModelKeys.MODEL);
        expect(decorators[0].props).toEqual({
            class: "TestModel"
        })
    });

    it('Register the model to the registry', () => {
        const tm = new TestModel();
        const tmFromRegistry = ModelRegistry.build(tm.constructor.name)
        expect(tmFromRegistry).toBeDefined();
    });
})