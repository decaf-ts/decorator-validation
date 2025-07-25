import type { ModelArg } from "../../src";
import {
  list,
  minlength,
  model,
  Model,
  ModelErrorDefinition,
  required,
} from "../../src";

@model()
class InnerTestModel extends Model {
  @required()
  id!: string;

  @required()
  value!: string;

  constructor(arg: ModelArg<InnerTestModel>) {
    super(arg);
  }

  hasErrors(...exclusions: any[]): ModelErrorDefinition | undefined {
    return super.hasErrors(...exclusions);
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
});
