import type { ModelArg } from "../../src";
import {
  list,
  minlength,
  model,
  Model,
  ModelErrorDefinition,
  required,
  type,
} from "../../src";

@model()
class SimpleNestedModel extends Model {
  @required()
  value!: number;

  constructor(arg: ModelArg<SimpleNestedModel>) {
    super(arg);
  }
}

@model()
class SimpleNestedModel2 extends Model {
  @required()
  name!: string;

  constructor(arg: ModelArg<SimpleNestedModel2>) {
    super(arg);
  }
}

@model()
class InnerTestModel extends Model {
  @required()
  id!: string;

  @required()
  value!: string;

  @type(SimpleNestedModel)
  child!: SimpleNestedModel;

  @list(SimpleNestedModel)
  childList!: SimpleNestedModel[];

  @list([SimpleNestedModel, SimpleNestedModel2])
  multipleTypeList!: any[];

  constructor(arg: ModelArg<InnerTestModel>) {
    super(arg);
  }
}

@model()
class OuterTestModel extends Model {
  @required()
  id!: string;

  @required()
  name!: string;

  @required()
  child!: InnerTestModel;

  constructor(arg: ModelArg<OuterTestModel>) {
    super(arg);
  }

  hasErrors(
    previousVersion?: any,
    ...exclusions: any[]
  ): ModelErrorDefinition | undefined {
    return super.hasErrors(previousVersion, ...exclusions);
  }
}

@model()
class SimpleChildModel extends Model {
  @required()
  child2!: SimpleNestedModel;

  @required()
  childValue!: string;

  constructor(arg: ModelArg<SimpleChildModel>) {
    super(arg);
  }
}

@model()
class SimpleParentModel extends Model {
  @required()
  child1!: SimpleChildModel;

  @required()
  parentValue!: string;

  constructor(arg: ModelArg<SimpleParentModel>) {
    super(arg);
  }
}

@model()
class OuterListTestModel extends Model {
  @required()
  id!: string;

  @list(InnerTestModel)
  @minlength(1)
  @required()
  children!: InnerTestModel[];

  constructor(arg: ModelArg<OuterTestModel>) {
    super(arg);
  }
}

describe("Nested Validation", () => {
  beforeAll(() => {
    Model.setBuilder(Model.fromModel);
  });

  afterAll(() => {
    Model.setBuilder();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("Fails the nested validation", async () => {
    const model = new OuterTestModel({
      child: {},
    });

    const errors = model.hasErrors();
    expect(errors).toBeDefined();
    expect(errors).toEqual(
      new ModelErrorDefinition({
        id: { required: "This field is required" },
        name: { required: "This field is required" },
        "child.id": { required: "This field is required" },
        "child.value": { required: "This field is required" },
      } as any)
    );
  });

  it("Passes nested validation", async () => {
    const model: OuterTestModel = new OuterTestModel({
      id: Date.now().toString(),
      name: "any",
      child: {
        id: Date.now().toString(),
        value: "value",
      },
    });

    const validateMock = jest.spyOn(
      model?.child as InnerTestModel,
      "hasErrors"
    );
    expect(model.hasErrors()).toBeUndefined();
    expect(validateMock).toHaveBeenCalledTimes(1);
  });

  it("also handles lists", async () => {
    let model = new OuterListTestModel({
      id: Date.now().toString(),
      children: [
        {
          value: "1",
        },
        {
          value: "2",
        },
      ],
    });

    const errs = model.hasErrors();
    expect(errs).toBeDefined();

    model = new OuterListTestModel({
      id: Date.now().toString(),
      children: [
        {
          id: Date.now().toString(),
          value: "1",
        },
        {
          id: Date.now().toString(),
          value: "2",
        },
      ],
    });

    const validateMock1 = jest.spyOn(
      (model?.children as InnerTestModel[])[0] as InnerTestModel,
      "hasErrors"
    );
    const validateMock2 = jest.spyOn(
      (model?.children as InnerTestModel[])[1] as InnerTestModel,
      "hasErrors"
    );

    expect(model?.hasErrors()).toBeUndefined();
    expect(validateMock1).toHaveBeenCalledTimes(1);
    expect(validateMock2).toHaveBeenCalledTimes(1);
  });

  it("should fail when nested model is a different type", async () => {
    const model: OuterTestModel = new OuterTestModel({
      id: Date.now().toString(),
      name: "any",
      child: new OuterTestModel({}) as any,
    });

    const validateMock = jest.spyOn(
      model?.child as InnerTestModel,
      "hasErrors"
    );

    const innerModelConstr = Model.get(InnerTestModel.name);
    expect(new InnerTestModel({}) instanceof innerModelConstr).toBeTruthy();
    expect(model instanceof innerModelConstr).toBeFalsy();

    const errors = model.hasErrors();
    expect(errors).toBeDefined();
    expect(errors).toBeInstanceOf(ModelErrorDefinition);
    expect(errors).toEqual(
      new ModelErrorDefinition({
        child: {
          type: "Value must be an instance of InnerTestModel",
        },
      })
    );
    // .hasErrors should not be called — an error is expected to be thrown before that
    expect(validateMock).toHaveBeenCalledTimes(0);

    model.child = new InnerTestModel({
      id: Date.now().toString(),
      value: Date.now().toString(),
      child: new InnerTestModel({}),
    });
    const childNestedValidationMock = jest.spyOn(
      model?.child?.child as SimpleNestedModel,
      "hasErrors"
    );
    const childNestedErrs = model.hasErrors();
    expect(childNestedErrs).toBeDefined();
    expect(childNestedErrs).toBeInstanceOf(ModelErrorDefinition);
    expect(childNestedErrs).toEqual(
      new ModelErrorDefinition({
        "child.child": {
          type: "Value must be an instance of SimpleNestedModel",
        },
      })
    );
    // .hasErrors should not be called — an error is expected to be thrown before that
    expect(childNestedValidationMock).toHaveBeenCalledTimes(0);

    model.child = new InnerTestModel({
      id: Date.now().toString(),
      value: Date.now().toString(),
      child: new SimpleNestedModel({ value: 10 }),
      childList: [],
    });
    // overwrite model.builder
    model.child.childList = [
      new SimpleNestedModel({ value: 10 }),
      new InnerTestModel({}),
    ] as any;
    const child0NestedValidationMock = jest.spyOn(
      model?.child?.childList[0] as SimpleNestedModel,
      "hasErrors"
    );
    const child1NestedValidationMock = jest.spyOn(
      model?.child?.childList[1] as SimpleNestedModel,
      "hasErrors"
    );
    const childListNestedErrs = model.hasErrors();
    expect(childListNestedErrs).toBeDefined();
    expect(childListNestedErrs).toBeInstanceOf(ModelErrorDefinition);
    expect(childListNestedErrs).toEqual(
      new ModelErrorDefinition({
        "child.childList": {
          list: "Invalid list of SimpleNestedModel",
        },
      })
    );
    expect(child0NestedValidationMock).toHaveBeenCalledTimes(0);
    expect(child1NestedValidationMock).toHaveBeenCalledTimes(0);

    // multipleTypeList
    model.child = new InnerTestModel({
      id: Date.now().toString(),
      value: Date.now().toString(),
      child: new SimpleNestedModel({ value: 10 }),
      multipleTypeList: [],
    });
    // overwrite model.builder
    model.child.multipleTypeList = [
      new SimpleNestedModel({ value: 10 }),
      new SimpleNestedModel2({ name: "test" }),
      new InnerTestModel({}),
    ] as any;
    const list0NestedValidationMock = jest.spyOn(
      model?.child?.multipleTypeList[0] as SimpleNestedModel,
      "hasErrors"
    );
    const list1NestedValidationMock = jest.spyOn(
      model?.child?.multipleTypeList[1] as SimpleNestedModel,
      "hasErrors"
    );
    const list2NestedValidationMock = jest.spyOn(
      model?.child?.multipleTypeList[2] as SimpleNestedModel,
      "hasErrors"
    );
    const multipleTypeListErrors = model.hasErrors();
    expect(multipleTypeListErrors).toBeDefined();
    expect(multipleTypeListErrors).toBeInstanceOf(ModelErrorDefinition);
    expect(multipleTypeListErrors).toEqual(
      new ModelErrorDefinition({
        "child.multipleTypeList": {
          list: "Invalid list of SimpleNestedModel,SimpleNestedModel2",
        },
      })
    );
    expect(list0NestedValidationMock).toHaveBeenCalledTimes(0);
    expect(list1NestedValidationMock).toHaveBeenCalledTimes(0);
    expect(list2NestedValidationMock).toHaveBeenCalledTimes(0);
  });
  it("should exclude from validation simple and nested properties", () => {
    const parentModel = new SimpleParentModel({
      child1: new SimpleChildModel({
        childValue: 12,
        child2: new SimpleNestedModel({ value: "should be number" }),
      }),
    });

    expect(parentModel.hasErrors()).toEqual(
      new ModelErrorDefinition({
        ["child1.child2.value"]: {
          type: "Invalid type. Expected Number, received string",
        },
        ["child1.childValue"]: {
          type: "Invalid type. Expected String, received number",
        },
        parentValue: { required: "This field is required" },
      })
    );
    expect(
      parentModel.hasErrors("parentValue", "childValue", "value")
    ).toBeUndefined();
    expect(parentModel.hasErrors("parentValue", "child1.childValue")).toEqual(
      new ModelErrorDefinition({
        ["child1.child2.value"]: {
          type: "Invalid type. Expected Number, received string",
        },
      })
    );
    expect(
      parentModel.hasErrors("parentValue", "childValue", "child1.child2.value")
    ).toBeUndefined();
  });
});
