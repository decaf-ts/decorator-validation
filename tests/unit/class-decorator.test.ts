import {model, Model, ModelKeys} from "../../src";
import {getClassDecorators} from "@decaf-ts/reflection";

@model()
class TestModel extends Model {

    name?: string = undefined;

    constructor(model?: TestModel | {}){
        super(model);
    }
}

describe('Class Decorators', () => {

    it('Defines the anchor property', () => {
        const tm = new TestModel();
        expect(Model.getMetadata(tm)).toEqual(tm.constructor.name)
    })

    it('Register the model to the registry', () => {
        const tm = new TestModel();
        const tmFromRegistry = Model.build(Model.deserialize(tm.serialize()));
        expect(tmFromRegistry).toBeDefined();
    });
})