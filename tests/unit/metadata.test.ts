import {getModelKey, model, Model, ModelArg, ModelKeys, required} from "../../src";
import {metadata} from "@decaf-ts/reflection";

describe("metadata", () => {
  @metadata(getModelKey(ModelKeys.MODEL), TestModel1.name)
  class TestModel1 extends Model {
    @required()
    name?: string = undefined
    constructor(arg?: ModelArg<Model>) {
      super(arg);
    }
  }
  @metadata(getModelKey(ModelKeys.MODEL), TestModel2.name)
  class TestModel2 extends Model {
    @required()
    name?: string = undefined
    constructor(arg?: ModelArg<Model>) {
      super(arg);
    }
  }
  @metadata(getModelKey(ModelKeys.MODEL), TestModel3.name)
  class TestModel3 extends TestModel1 {
    @required()
    description?: string = undefined
    constructor(arg?: ModelArg<TestModel3>) {
      super(arg);
    }
  }

  @metadata(getModelKey(ModelKeys.MODEL), TestModel4.name)
  class TestModel4 extends TestModel2 {
    @required()
    description?: string = undefined
    constructor(arg?: ModelArg<TestModel4>) {
      super(arg);
    }
  }

  it("Properly stores metadata", () => {
    const m1 = new TestModel1()
    const m2 = new TestModel2()
    const m3 = new TestModel3()
    const m4 = new TestModel4()
    // expect(Reflect.getMetadata(getModelKey(ModelKeys.MODEL), TestModel1.constructor)).toEqual(TestModel1.name)
    // expect(Reflect.getMetadata(getModelKey(ModelKeys.MODEL), TestModel2.constructor)).toEqual(TestModel2.name)
    // expect(Reflect.getMetadata(getModelKey(ModelKeys.MODEL), TestModel3.constructor)).toEqual(TestModel3.name)
    expect(Reflect.getMetadata(getModelKey(ModelKeys.MODEL), TestModel4)).toEqual(TestModel4.name)
  })
})