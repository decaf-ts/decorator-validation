import { Model, ModelKeys, required } from "../../src";
import type { ModelArg } from "../../src";
import { Metadata, metadata } from "@decaf-ts/decoration";

describe("metadata", () => {
  @metadata(ModelKeys.MODEL, "TestModel1")
  class TestModel1 extends Model {
    @required()
    name!: string;
    constructor(arg?: ModelArg<Model>) {
      super(arg);
    }
  }
  @metadata(ModelKeys.MODEL, "TestModel2")
  class TestModel2 extends Model {
    @required()
    name!: string;
    constructor(arg?: ModelArg<Model>) {
      super(arg);
    }
  }
  @metadata(ModelKeys.MODEL, "TestModel3")
  class TestModel3 extends TestModel1 {
    @required()
    description?: string = undefined;
    constructor(arg?: ModelArg<TestModel3>) {
      super(arg);
    }
  }

  @metadata(ModelKeys.MODEL, "TestModel4")
  class TestModel4 extends TestModel2 {
    @required()
    description?: string = undefined;
    constructor(arg?: ModelArg<TestModel4>) {
      super(arg);
    }
  }

  it("Properly stores metadata", () => {
    expect(Metadata.get(TestModel1, ModelKeys.MODEL)).toEqual(TestModel1.name);
    expect(Metadata.get(TestModel2, ModelKeys.MODEL)).toEqual(TestModel2.name);
    expect(Metadata.get(TestModel3, ModelKeys.MODEL)).toEqual(TestModel3.name);
    expect(Metadata.get(TestModel4, ModelKeys.MODEL)).toEqual(TestModel4.name);
  });
});
