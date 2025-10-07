import {
  min,
  model,
  Model,
  ModelArg,
  required,
  step,
  ValidationKeys,
} from "../../src";
import { description, Metadata } from "@decaf-ts/decoration";

describe("metadata and decoration order", () => {
  it("Reads metadata from an undecorated model", () => {
    @description("Undecorated Model description")
    class UndecoratedModel extends Model {
      @description("Undecorated Model id description")
      @required()
      @min(0)
      @step(0.01)
      id!: number;

      constructor(arg?: ModelArg<UndecoratedModel>) {
        super(arg);
        Model.fromModel(this, arg);
      }
    }

    const classDescription = Model.describe(UndecoratedModel);
    const propDescription = Model.describe(UndecoratedModel, "id");
    const validations = Metadata.validationFor(UndecoratedModel);
    const validationId = Metadata.validationFor(UndecoratedModel, "id");
    const validationsIdRequired = Metadata.validationFor(
      UndecoratedModel,
      "id",
      ValidationKeys.REQUIRED
    );

    expect(classDescription).toEqual("Undecorated Model description");
    expect(propDescription).toEqual("Undecorated Model id description");

    const requiredValids = expect.objectContaining({
      description: "defines the attribute as required",
      message: "This field is required",
      async: false,
    });

    const innerValids = expect.objectContaining({
      [ValidationKeys.REQUIRED]: requiredValids,
      [ValidationKeys.MIN]: {
        [ValidationKeys.MIN]: 0,
        description:
          "defines the max value of the attribute as 0 (applies to numbers or Dates)",
        message: "The minimum value is {0}",
        async: false,
      },
      [ValidationKeys.STEP]: {
        [ValidationKeys.STEP]: 0.01,
        description: "defines the step of the attribute as 0.01",
        message: "Invalid value. Not a step of {0}",
        async: false,
      },
    });

    expect(validations).toEqual(
      expect.objectContaining({
        id: innerValids,
      })
    );
    expect(validationId).toEqual(innerValids);
    expect(validationsIdRequired).toEqual(requiredValids);
  });

  it("Reads metadata from a decorated model (decoration above @model)", () => {
    @description("Decorated over Model description")
    @model()
    class DecoratedModel extends Model {
      @description("Decorated Model id description")
      @required()
      @min(0)
      @step(0.01)
      id!: number;

      constructor(arg?: ModelArg<DecoratedModel>) {
        super(arg);
      }
    }

    const classDescription = Model.describe(DecoratedModel);
    const propDescription = Model.describe(DecoratedModel, "id");
    const validations = Metadata.validationFor(DecoratedModel);
    const validationId = Metadata.validationFor(DecoratedModel, "id");
    const validationsIdRequired = Metadata.validationFor(
      DecoratedModel,
      "id",
      ValidationKeys.REQUIRED
    );

    expect(classDescription).toEqual("Decorated over Model description");
    expect(propDescription).toEqual("Decorated Model id description");

    const requiredValids = expect.objectContaining({
      description: "defines the attribute as required",
      message: "This field is required",
      async: false,
    });

    const innerValids = expect.objectContaining({
      [ValidationKeys.REQUIRED]: requiredValids,
      [ValidationKeys.MIN]: {
        [ValidationKeys.MIN]: 0,
        description:
          "defines the max value of the attribute as 0 (applies to numbers or Dates)",
        message: "The minimum value is {0}",
        async: false,
      },
      [ValidationKeys.STEP]: {
        [ValidationKeys.STEP]: 0.01,
        description: "defines the step of the attribute as 0.01",
        message: "Invalid value. Not a step of {0}",
        async: false,
      },
    });

    expect(validations).toEqual(
      expect.objectContaining({
        id: innerValids,
      })
    );
    expect(validationId).toEqual(innerValids);
    expect(validationsIdRequired).toEqual(requiredValids);
  });

  it("Reads metadata from a decorated model (decoration bellow @model)", () => {
    @model()
    @description("Decorated over Model description")
    class DecoratedModel2 extends Model {
      @description("Decorated Model id description")
      @required()
      @min(10)
      @step(1)
      id!: number;

      @description("Decorated Model name description")
      @required()
      name!: string;

      constructor(arg?: ModelArg<DecoratedModel2>) {
        super(arg);
      }
    }

    const classDescription = Model.describe(DecoratedModel2);
    const propDescription = Model.describe(DecoratedModel2, "id");
    const propNameDescription = Model.describe(DecoratedModel2, "name");
    const validations = Metadata.validationFor(DecoratedModel2);
    const validationId = Metadata.validationFor(DecoratedModel2, "id");
    const validationName = Metadata.validationFor(DecoratedModel2, "name");
    const validationsIdRequired = Metadata.validationFor(
      DecoratedModel2,
      "id",
      ValidationKeys.REQUIRED
    );

    expect(classDescription).toEqual("Decorated over Model description");
    expect(propDescription).toEqual("Decorated Model id description");
    expect(propNameDescription).toEqual("Decorated Model name description");

    const requiredValids = expect.objectContaining({
      description: "defines the attribute as required",
      message: "This field is required",
      async: false,
    });

    const innerValids = expect.objectContaining({
      [ValidationKeys.REQUIRED]: requiredValids,
      [ValidationKeys.MIN]: {
        [ValidationKeys.MIN]: 10,
        description:
          "defines the max value of the attribute as 10 (applies to numbers or Dates)",
        message: "The minimum value is {0}",
        async: false,
      },
      [ValidationKeys.STEP]: {
        [ValidationKeys.STEP]: 1,
        description: "defines the step of the attribute as 1",
        message: "Invalid value. Not a step of {0}",
        async: false,
      },
    });

    const innerNmeValids = expect.objectContaining({
      [ValidationKeys.REQUIRED]: requiredValids,
    });

    expect(validations).toEqual(
      expect.objectContaining({
        id: innerValids,
        name: innerNmeValids,
      })
    );
    expect(validationId).toEqual(innerValids);
    expect(validationsIdRequired).toEqual(requiredValids);
  });
});
