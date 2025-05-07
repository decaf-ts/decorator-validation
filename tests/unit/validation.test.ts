import {
  diff,
  email,
  eq,
  gt,
  gte,
  lt,
  lte,
  max,
  maxlength,
  min,
  minlength,
  model,
  Model,
  ModelArg,
  ModelErrorDefinition,
  password,
  pattern,
  prop,
  required,
  step,
  type,
  url,
  ValidationKeys,
} from "../../src";

@model()
class InnerTestModel extends Model {
  constructor() {
    super();
  }
}

@model()
class TestModel extends Model {
  @type(["string", "number"])
  @required()
  id!: string | number;

  @prop()
  irrelevant?: string;

  @required()
  @max(100)
  @step(5)
  @min(0)
  prop1!: number;

  @maxlength(10)
  @minlength(5)
  prop2?: string;

  @pattern(/^\w+$/g)
  prop3?: string;

  @email()
  prop4?: string;

  @pattern("^\\w+$")
  prop5?: string;

  @url()
  prop6?: string;

  @type(InnerTestModel.name)
  prop7?: InnerTestModel;

  constructor(model?: ModelArg<TestModel>) {
    super(model);
    Model.fromModel<TestModel>(this, model);
  }
}

@model()
class PasswordTestModel extends Model {
  @password()
  password?: string;

  constructor(model?: ModelArg<PasswordTestModel>) {
    super();
    Model.fromModel(this, model);
  }
}

@model()
class ListModelTest extends Model {
  // @list(String)
  @maxlength(2)
  @minlength(1)
  @required()
  strings!: string[];

  constructor(model?: ModelArg<ListModelTest>) {
    super();
    Model.fromModel(this, model);
  }
}

describe("Model Test", function () {
  it("Create with required properties as undefined", function () {
    const empty = new TestModel();
    const keys = Object.keys(empty);
    expect(keys.length).toBe(9);
  });

  it("outputs to string nicely", function () {
    const dm = new TestModel({
      id: "id",
      prop1: 23,
      prop2: "tests",
      prop3: "asdasfsdfsda",
      prop4: "test@pdm.com",
      prop8: new Date(),
    });

    const output = dm.toString();
    expect(output).toBe(
      `TestModel: {
  "id": "id",
  "prop1": 23,
  "prop2": "tests",
  "prop3": "asdasfsdfsda",
  "prop4": "test@pdm.com"
}`
    );
  });

  it("Create & Equality & Hash", function () {
    const dm = new TestModel({
      id: "id",
      prop1: 23,
      prop2: "tests",
      prop3: "asdasfsdfsda",
      prop4: "test@pdm.com",
    });

    const dm2 = new TestModel(dm);
    const equality = dm.equals(dm2);
    const reverseEquality = dm2.equals(dm);
    const identity = dm === dm2;
    expect(equality).toBe(true);
    expect(dm.hash()).toEqual(dm2.hash());
    expect(reverseEquality).toBe(true);
    expect(identity).toBe(false);
  });
});

describe("Validation by decorators test", function () {
  it("Success Validation", function () {
    const dm = new TestModel({
      id: "id",
      prop1: 25,
      prop2: "tests",
      prop3: "asdasfsdfsda",
      prop4: "test@pdm.com",
      prop5: "asdasdasd",
      prop6: "http://www.thisisatest.com",
      prop7: new InnerTestModel(),
    });

    const errors = dm.hasErrors();
    expect(errors).toBeUndefined();
  });

  it("Failure Validation", function () {
    const dm = new TestModel({
      prop1: 237,
      prop2: "te",
      prop3: "asdasfsdf  sda",
      prop4: "asdasfsdf  sda",
      prop5: "asdasfsdf  sda",
      prop6: "asdasfsdf  sda",
    });

    const errors = dm.hasErrors();
    expect(errors).toBeDefined();
    if (errors) {
      expect(Object.keys(errors)).toBeInstanceOf(Array);
      expect(errors && Object.values(errors).length).toBe(7);
      expect(errors.toString()).toBe(
        "id - This field is required\nprop1 - Invalid value. Not a step of 5\nThe maximum value is 100\n" +
          "prop2 - The minimum length is 5\nprop3 - The value does not match the pattern\n" +
          "prop4 - The value is not a valid email\nprop5 - The value does not match the pattern\nprop6 - The value is not a valid URL"
      );
    }
  });

  it("Ignores Properties in validation when necessary", function () {
    const dm = new TestModel({
      prop1: 237,
      prop2: "te",
      prop3: "asdasfsdf  sda",
      prop4: "asdasfsdf  sda",
      prop5: "asdasfsdf  sda",
      prop6: "asdasfsdf  sda",
    });

    let errors = dm.hasErrors();
    expect(errors).toBeDefined();
    if (errors) {
      expect(Object.keys(errors)).toBeInstanceOf(Array);
      expect(errors && Object.values(errors).length).toBe(7);
    }

    errors = dm.hasErrors("prop4");
    expect(errors).toBeDefined();
    if (errors) {
      expect(Object.keys(errors)).toBeInstanceOf(Array);
      expect(errors && Object.values(errors).length).toBe(6);
    }
  });

  it("Pass with non required undefined values", function () {
    const dm = new TestModel({
      prop1: 235,
    });

    const errors = dm.hasErrors();
    expect(errors).toBeDefined();
    if (errors) {
      expect(Object.keys(errors)).toBeInstanceOf(Array);
      expect(errors && Object.keys(errors).length).toBe(2);
      expect(errors.toString()).toBe(
        "id - This field is required\nprop1 - The maximum value is 100"
      );
    }
  });

  it("Handles Dates", function () {
    const dm = new TestModel({
      prop1: 235,
      prop8: "test",
    });

    const errors = dm.hasErrors();
    expect(errors).toBeDefined();
    if (errors) {
      expect(Object.keys(errors)).toBeInstanceOf(Array);
      expect(errors && Object.keys(errors).length).toBe(2);
      expect(errors.toString()).toBe(
        "id - This field is required\nprop1 - The maximum value is 100"
      );
    }
  });

  it("handles Passwords", () => {
    let p: Model = new PasswordTestModel({
      password: "testssdfdsg",
    });

    let errors: ModelErrorDefinition | undefined = p.hasErrors();
    expect(errors).toBeDefined();

    p = new PasswordTestModel({
      password: "ThisSHouldB3aVaLL_idPass0rd!",
    });

    errors = p.hasErrors();
    expect(errors).toBeUndefined();
  });

  it("handles Arrays", () => {
    let p: Model = new ListModelTest({
      strings: [],
    });

    let errors: ModelErrorDefinition | undefined = p.hasErrors();
    expect(errors).toBeDefined();

    p = new ListModelTest({
      strings: ["test", "test", "test"],
    });

    errors = p.hasErrors();
    expect(errors).toBeDefined();

    p = new ListModelTest({
      strings: ["test", "test"],
    });

    errors = p.hasErrors();
    expect(errors).toBeUndefined();
  });

  describe("Comparison Decorators", () => {
    const fieldMapping = {
      stringValue: "mirrorStringValue",
      numberValue: "numberValue",
      booleanValue: "anyBooleanValue",
      arrayValue: "arrayValue",
      objectValue: "objectValue",
    };

    @model()
    class MultiTypeMirrorModel extends Model {
      @required()
      mirrorStringValue: string = "";

      @required()
      numberValue: number = 0;

      @required()
      anyBooleanValue: boolean = false;

      @required()
      arrayValue: string[] = [];

      @required()
      objectValue: Record<string, any> = {};

      constructor(model?: ModelArg<MultiTypeMirrorModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    @model()
    class LessThanTestModel extends Model {
      @required()
      mirrorNumberValue: number = 0;

      @required()
      mirrorDateValue: Date = new Date(0);

      constructor(model?: ModelArg<LessThanTestModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    describe("EqualsValidator", () => {
      @model()
      class MultiTypeEqualsModel extends Model {
        @eq("mirror.mirrorStringValue")
        stringValue: string = "";

        @eq("mirror.numberValue")
        numberValue: number = 0;

        @eq("mirror.anyBooleanValue")
        booleanValue: boolean = false;

        @eq("mirror.arrayValue")
        arrayValue: string[] = [];

        @eq("mirror.objectValue")
        objectValue: Record<string, any> = {};

        @type(MultiTypeMirrorModel.name)
        mirror?: MultiTypeMirrorModel;

        constructor(model?: ModelArg<MultiTypeEqualsModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      @model()
      class InvalidPropertyModel extends Model {
        @eq("mirror.stringValue")
        stringValue: string = "";

        @type(MultiTypeMirrorModel.name)
        mirror?: MultiTypeMirrorModel;

        constructor(model?: ModelArg<MultiTypeEqualsModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      it("should pass validation for all supported types", () => {
        const model = new MultiTypeEqualsModel({
          stringValue: "hello",
          numberValue: 42,
          booleanValue: true,
          arrayValue: ["a", "b", "c"],
          objectValue: { foo: "bar" },
          mirror: new MultiTypeMirrorModel({
            mirrorStringValue: "hello",
            numberValue: 42,
            anyBooleanValue: true,
            arrayValue: ["a", "b", "c"],
            objectValue: { foo: "bar" },
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeUndefined();
      });

      it("should return validation errors for mismatched values", () => {
        const model = new MultiTypeEqualsModel({
          stringValue: "mismatch",
          numberValue: 100,
          booleanValue: false,
          arrayValue: ["x", "y"],
          objectValue: { foo: "wrong" },
          mirror: new MultiTypeMirrorModel({
            mirrorStringValue: "expected",
            numberValue: 99,
            anyBooleanValue: true,
            arrayValue: ["a", "b"],
            objectValue: { foo: "bar" },
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(Object.keys(new MultiTypeMirrorModel({})).length).toEqual(
          Object.keys(fieldMapping).length
        );
        for (const [parentKey, mirrorKey] of Object.entries(fieldMapping)) {
          expect(errors?.[parentKey]).toEqual({
            [ValidationKeys.EQUALS]:
              "This field must be equal to field mirror." + mirrorKey,
          });
        }
      });

      it("should return validation errors for property does not exist", () => {
        const model = new InvalidPropertyModel({
          stringValue: "mismatch",
          mirror: new MultiTypeMirrorModel({
            mirrorStringValue: "expected",
            numberValue: 99,
            anyBooleanValue: true,
            arrayValue: ["a", "b"],
            objectValue: { foo: "bar" },
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.stringValue).toEqual({
          [ValidationKeys.EQUALS]:
            "Failed to resolve path mirror.stringValue: property 'stringValue' does not exist.",
        });
        expect(Object.keys(errors || {}).length).toEqual(1);
      });
    });

    describe("DiffValidator", () => {
      @model()
      class MultiTypeDiffModel extends Model {
        @diff("mirror.mirrorStringValue")
        stringValue: string = "";

        @diff("mirror.numberValue")
        numberValue: number = 0;

        @diff("mirror.anyBooleanValue")
        booleanValue: boolean = false;

        @diff("mirror.arrayValue")
        arrayValue: string[] = [];

        @diff("mirror.objectValue")
        objectValue: Record<string, any> = {};

        @type(MultiTypeMirrorModel.name)
        mirror?: MultiTypeMirrorModel;

        constructor(model?: ModelArg<MultiTypeDiffModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      @model()
      class InvalidPropertyModel extends Model {
        @diff("mirror.stringValue")
        stringValue: string = "";

        @type(MultiTypeMirrorModel.name)
        mirror?: MultiTypeMirrorModel;

        constructor(model?: ModelArg<MultiTypeDiffModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      it("should pass validation for all supported types when values are different", () => {
        const model = new MultiTypeMirrorModel({
          mirrorStringValue: "world",
          numberValue: 100,
          anyBooleanValue: false,
          arrayValue: ["x", "y", "z"],
          objectValue: { foo: "baz" },
        });

        const errors = model.hasErrors();
        expect(errors).toBeUndefined();
      });

      it("should return validation errors when values are the same", () => {
        const model = new MultiTypeDiffModel({
          stringValue: "same",
          numberValue: 123,
          booleanValue: true,
          arrayValue: ["item1", "item2"],
          objectValue: { key: "value" },
          mirror: new MultiTypeMirrorModel({
            mirrorStringValue: "same",
            numberValue: 123,
            anyBooleanValue: true,
            arrayValue: ["item1", "item2"],
            objectValue: { key: "value" },
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(Object.keys(new MultiTypeMirrorModel({})).length).toEqual(
          Object.keys(fieldMapping).length
        );
        for (const [parentKey, mirrorKey] of Object.entries(fieldMapping)) {
          expect(errors?.[parentKey]).toEqual({
            [ValidationKeys.DIFF]:
              "This field must be different from field mirror." + mirrorKey,
          });
        }
      });

      it("should return validation errors for property that does not exist", () => {
        const model = new InvalidPropertyModel({
          stringValue: "mismatch",
          mirror: new MultiTypeMirrorModel({
            mirrorStringValue: "expected",
            numberValue: 99,
            anyBooleanValue: true,
            arrayValue: ["a", "b"],
            objectValue: { foo: "bar" },
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.stringValue).toEqual({
          [ValidationKeys.DIFF]:
            "Failed to resolve path mirror.stringValue: property 'stringValue' does not exist.",
        });
        expect(Object.keys(errors || {}).length).toEqual(1);
      });
    });

    describe("LessThanValidator", () => {
      @model()
      class MultiTypeLessThanModel extends Model {
        @lt("mirror.mirrorNumberValue")
        numberValue: number = 0;

        @lt("mirror.mirrorDateValue")
        dateValue: Date = new Date(0);

        @type(LessThanTestModel.name)
        mirror?: LessThanTestModel;

        constructor(model?: ModelArg<MultiTypeLessThanModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      @model()
      class InvalidPropertyModel extends Model {
        @lt("mirror.invalidField")
        numberValue: number = 0;

        @type(LessThanTestModel.name)
        mirror?: LessThanTestModel;

        constructor(model?: ModelArg<InvalidPropertyModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      it("should pass validation when fields are less than the target fields", () => {
        const model = new MultiTypeLessThanModel({
          numberValue: 19,
          dateValue: new Date("2024-01-01"),
          mirror: new LessThanTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeUndefined();
      });

      it("should fail when compare fields are equal", () => {
        const model = new MultiTypeLessThanModel({
          numberValue: 20,
          dateValue: new Date("2025-01-01"),
          mirror: new LessThanTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.LESS_THAN]:
            "This field must be less than field mirror.mirrorNumberValue",
        });
        expect(errors?.dateValue).toEqual({
          [ValidationKeys.LESS_THAN]:
            "This field must be less than field mirror.mirrorDateValue",
        });
      });

      it("should fail when fields are not less than the target fields", () => {
        const model = new MultiTypeLessThanModel({
          numberValue: 30,
          dateValue: new Date("2026-01-01"),
          mirror: new LessThanTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.LESS_THAN]:
            "This field must be less than field mirror.mirrorNumberValue",
        });
        expect(errors?.dateValue).toEqual({
          [ValidationKeys.LESS_THAN]:
            "This field must be less than field mirror.mirrorDateValue",
        });
      });

      it("should fail if target property does not exist", () => {
        const model = new InvalidPropertyModel({
          numberValue: 10,
          mirror: new LessThanTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.LESS_THAN]:
            "Failed to resolve path mirror.invalidField: property 'invalidField' does not exist.",
        });
        expect(Object.keys(errors || {}).length).toEqual(1);
      });
    });

    describe("GreaterThanValidator", () => {
      @model()
      class MirrorTestModel extends Model {
        @required()
        mirrorNumberValue: number = 0;

        @required()
        mirrorDateValue: Date = new Date();

        constructor(model?: ModelArg<MirrorTestModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      @model()
      class MultiTypeGreaterThanModel extends Model {
        @gt("mirror.mirrorNumberValue")
        numberValue: number = 0;

        @gt("mirror.mirrorDateValue")
        dateValue: Date = new Date();

        @type(MirrorTestModel.name)
        mirror?: MirrorTestModel;

        constructor(model?: ModelArg<MultiTypeGreaterThanModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      @model()
      class InvalidPropertyModel extends Model {
        @gt("mirror.inexistentField")
        numberValue: number = 0;

        @type(MirrorTestModel.name)
        mirror?: MirrorTestModel;

        constructor(model?: ModelArg<InvalidPropertyModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      it("should pass validation when values are greater than compared values", () => {
        const model = new MultiTypeGreaterThanModel({
          numberValue: 10,
          dateValue: new Date("2024-01-02"),
          mirror: new MirrorTestModel({
            mirrorNumberValue: 5,
            mirrorDateValue: new Date("2024-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeUndefined();
      });

      it("should fail when values are equal", () => {
        const model = new MultiTypeGreaterThanModel({
          numberValue: 5,
          dateValue: new Date("2024-01-01"),
          mirror: new MirrorTestModel({
            mirrorNumberValue: 5,
            mirrorDateValue: new Date("2024-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.GREATER_THAN]:
            "This field must be greater than field mirror.mirrorNumberValue",
        });
        expect(errors?.dateValue).toEqual({
          [ValidationKeys.GREATER_THAN]:
            "This field must be greater than field mirror.mirrorDateValue",
        });
      });

      it("should fail when values are not greater", () => {
        const model = new MultiTypeGreaterThanModel({
          numberValue: 3,
          dateValue: new Date("2024-01-01"),
          mirror: new MirrorTestModel({
            mirrorNumberValue: 5,
            mirrorDateValue: new Date("2024-01-02"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.GREATER_THAN]:
            "This field must be greater than field mirror.mirrorNumberValue",
        });
        expect(errors?.dateValue).toEqual({
          [ValidationKeys.GREATER_THAN]:
            "This field must be greater than field mirror.mirrorDateValue",
        });
      });

      it("should return validation error if compared property does not exist", () => {
        const model = new InvalidPropertyModel({
          numberValue: 10,
          mirror: new MirrorTestModel({
            mirrorNumberValue: 5,
            mirrorDateValue: new Date("2024-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.GREATER_THAN]:
            "Failed to resolve path mirror.inexistentField: property 'inexistentField' does not exist.",
        });
      });
    });

    describe("GreaterThanOrEqualValidator", () => {
      @model()
      class MirrorTestModel extends Model {
        @required()
        mirrorNumberValue: number = 0;

        @required()
        mirrorDateValue: Date = new Date(0);

        constructor(model?: ModelArg<MirrorTestModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      @model()
      class MultiTypeGreaterThanOrEqualModel extends Model {
        @gte("mirror.mirrorNumberValue")
        numberValue: number = 0;

        @gte("mirror.mirrorDateValue")
        dateValue: Date = new Date(0);

        @type(MirrorTestModel.name)
        mirror?: MirrorTestModel;

        constructor(model?: ModelArg<MultiTypeGreaterThanOrEqualModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      @model()
      class InvalidPropertyModel extends Model {
        @gte("mirror.invalidField")
        numberValue: number = 0;

        @type(MirrorTestModel.name)
        mirror?: MirrorTestModel;

        constructor(model?: ModelArg<InvalidPropertyModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      it("should pass when fields are greater than to the target fields", () => {
        const model = new MultiTypeGreaterThanOrEqualModel({
          numberValue: 21,
          dateValue: new Date("2026-01-01"),
          mirror: new MirrorTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeUndefined();
      });

      it("should pass when fields are equal to the target fields", () => {
        const model = new MultiTypeGreaterThanOrEqualModel({
          numberValue: 20,
          dateValue: new Date("2025-01-01"),
          mirror: new MirrorTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeUndefined();
      });

      it("should fail when fields are less than the target fields", () => {
        const model = new MultiTypeGreaterThanOrEqualModel({
          numberValue: 10,
          dateValue: new Date("2023-01-01"),
          mirror: new MirrorTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.GREATER_THAN_OR_EQUAL]:
            "This field must be greater than or equal to field mirror.mirrorNumberValue",
        });
        expect(errors?.dateValue).toEqual({
          [ValidationKeys.GREATER_THAN_OR_EQUAL]:
            "This field must be greater than or equal to field mirror.mirrorDateValue",
        });
      });

      it("should fail if target property does not exist", () => {
        const model = new InvalidPropertyModel({
          numberValue: 30,
          mirror: new MirrorTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.GREATER_THAN_OR_EQUAL]:
            "Failed to resolve path mirror.invalidField: property 'invalidField' does not exist.",
        });
        expect(Object.keys(errors || {}).length).toEqual(1);
      });
    });

    describe("LessThanOrEqualValidator", () => {
      @model()
      class MirrorTestModel extends Model {
        @required()
        mirrorNumberValue: number = 0;

        @required()
        mirrorDateValue: Date = new Date(0);

        constructor(model?: ModelArg<MirrorTestModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      @model()
      class MultiTypeLessThanOrEqualModel extends Model {
        @lte("mirror.mirrorNumberValue")
        numberValue: number = 0;

        @lte("mirror.mirrorDateValue")
        dateValue: Date = new Date(0);

        @type(MirrorTestModel.name)
        mirror?: MirrorTestModel;

        constructor(model?: ModelArg<MultiTypeLessThanOrEqualModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      @model()
      class InvalidPropertyModel extends Model {
        @lte("mirror.invalidField")
        numberValue: number = 0;

        @type(MirrorTestModel.name)
        mirror?: MirrorTestModel;

        constructor(model?: ModelArg<InvalidPropertyModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      it("should pass when fields are less than the target fields", () => {
        const model = new MultiTypeLessThanOrEqualModel({
          numberValue: 10,
          dateValue: new Date("2022-01-01"),
          mirror: new MirrorTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeUndefined();
      });

      it("should pass when fields are equal to the target fields", () => {
        const model = new MultiTypeLessThanOrEqualModel({
          numberValue: 20,
          dateValue: new Date("2025-01-01"),
          mirror: new MirrorTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeUndefined();
      });

      it("should fail when fields are greater than the target fields", () => {
        const model = new MultiTypeLessThanOrEqualModel({
          numberValue: 30,
          dateValue: new Date("2026-01-01"),
          mirror: new MirrorTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.LESS_THAN_OR_EQUAL]:
            "This field must be less than or equal to field mirror.mirrorNumberValue",
        });
        expect(errors?.dateValue).toEqual({
          [ValidationKeys.LESS_THAN_OR_EQUAL]:
            "This field must be less than or equal to field mirror.mirrorDateValue",
        });
      });

      it("should fail if target property does not exist", () => {
        const model = new InvalidPropertyModel({
          numberValue: 10,
          mirror: new MirrorTestModel({
            mirrorNumberValue: 20,
            mirrorDateValue: new Date("2025-01-01"),
          }),
        });

        const errors = model.hasErrors();
        expect(errors).toBeDefined();
        expect(errors?.numberValue).toEqual({
          [ValidationKeys.LESS_THAN_OR_EQUAL]:
            "Failed to resolve path mirror.invalidField: property 'invalidField' does not exist.",
        });
        expect(Object.keys(errors || {}).length).toEqual(1);
      });
    });
  });
});
