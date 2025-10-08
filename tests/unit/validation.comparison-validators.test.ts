import type { ModelArg } from "../../src";
import {
  COMPARISON_ERROR_MESSAGES,
  date,
  diff,
  eq,
  gt,
  gte,
  list,
  lt,
  lte,
  model,
  Model,
  ModelErrorDefinition,
  required,
  sf,
  type,
  VALIDATION_PARENT_KEY,
  ValidationKeys,
} from "../../src";

describe("Comparison Validators", () => {
  const initialDate = new Date();
  const pastDate = new Date(initialDate.getTime() - 86400000); // 1d before
  const futureDate = new Date(initialDate.getTime() + 86400000); // 1d after

  describe("General", () => {
    @model()
    class SimpleChildTestModel extends Model {
      @eq("../parentValue")
      value!: string;

      @eq("../parentArray.4")
      elementValue: number = 5;

      constructor(model?: ModelArg<SimpleChildTestModel>) {
        super();
        Model.fromObject(this, model);
      }
    }

    @model()
    class SimpleParentTestModel extends Model {
      @required()
      parentValue: string;

      @required()
      @list(Number)
      parentArray: number[] = [1, 2, 3, 4, 5];

      @required()
      @type(SimpleChildTestModel.name)
      child: SimpleChildTestModel = new SimpleChildTestModel();

      constructor(model?: ModelArg<SimpleParentTestModel>) {
        super();
        Model.fromObject(this, model);
      }
    }

    it("should exclude VALIDATION_PARENT_KEY from object keys", () => {
      const instance = new SimpleParentTestModel({
        parentValue: "parentValue",
        parentArray: [1, 2, 3, 4, 5],
        child: new SimpleChildTestModel({
          value: "parentValue",
          elementValue: 5,
        }),
      }) as any;

      instance.child[VALIDATION_PARENT_KEY] = instance;
      expect(Object.keys(instance.child)).toMatchObject([
        "elementValue",
        "value",
      ]);

      const obj = { numberValue: 123, [VALIDATION_PARENT_KEY]: "value" };
      expect(obj[VALIDATION_PARENT_KEY]).toBeDefined();
      expect(obj[VALIDATION_PARENT_KEY]).toEqual("value");
      expect(Object.keys(obj)).toMatchObject(["numberValue"]);
    });

    it("should delete VALIDATION_PARENT_KEY after validation", () => {
      const instance = new SimpleParentTestModel({
        parentValue: "parentValue",
        parentArray: [1, 2, 3, 4, 5],
        child: new SimpleChildTestModel({
          value: "parentValue",
          elementValue: 5,
        }),
      }) as any;

      instance.child[VALIDATION_PARENT_KEY] = instance;
      expect(instance.child[VALIDATION_PARENT_KEY]).toBeDefined();
      const errors = instance.hasErrors();
      expect(errors).toBeUndefined();
      expect(instance.child[VALIDATION_PARENT_KEY]).toBeUndefined();
    });

    it("should fail when referencing a non-existent parent array element", () => {
      const instance = new SimpleParentTestModel({
        parentValue: "parentValue",
        parentArray: [1, 2, 3],
        child: new SimpleChildTestModel({
          value: "parentValue",
          elementValue: 10,
        }),
      });

      expect(instance.hasErrors()).toEqual(
        new ModelErrorDefinition({
          "child.elementValue": {
            equals: sf(COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_EXIST, "4"),
          },
        })
      );

      instance.parentArray = [1, 2, 3, 4, 5];
      instance.child.elementValue = instance.parentArray[4];
      expect(instance.hasErrors()).toBeUndefined();
    });
  });

  describe("Child Comparison", () => {
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
      @list(String)
      arrayValue: string[] = [];

      @required()
      objectValue: Record<string, any> = {};

      constructor(model?: ModelArg<MultiTypeMirrorModel>) {
        super(model);
      }
    }

    @model()
    class LessThanTestModel extends Model {
      @required()
      mirrorNumberValue: number = 0;

      @required()
      mirrorDateValue: Date = new Date(0);

      constructor(model?: ModelArg<LessThanTestModel>) {
        super(model);
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
        @list(String)
        arrayValue: string[] = [];

        @eq("mirror.objectValue")
        objectValue: Record<string, any> = {};

        @type(MultiTypeMirrorModel.name)
        mirror?: MultiTypeMirrorModel;

        constructor(model?: ModelArg<MultiTypeEqualsModel>) {
          super(model);
        }
      }

      @model()
      class InvalidPropertyModel extends Model {
        @eq("mirror.stringValue")
        stringValue: string = "";

        @type(MultiTypeMirrorModel.name)
        mirror?: MultiTypeMirrorModel;

        constructor(model?: ModelArg<MultiTypeEqualsModel>) {
          super(model);
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
        expect(
          Object.keys(new MultiTypeMirrorModel({})).filter((k) => k !== "async")
            .length
        ).toEqual(Object.keys(fieldMapping).length);
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
          [ValidationKeys.EQUALS]: sf(
            COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_EXIST,
            "stringValue"
          ),
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
        @list(String)
        arrayValue: string[] = [];

        @diff("mirror.objectValue")
        objectValue: Record<string, any> = {};

        @type(MultiTypeMirrorModel.name)
        mirror?: MultiTypeMirrorModel;

        constructor(model?: ModelArg<MultiTypeDiffModel>) {
          super(model);
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
          Model.fromObject(this, model);
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
        expect(
          Object.keys(new MultiTypeMirrorModel({})).filter(
            (k) => !["async"].includes(k)
          ).length
        ).toEqual(Object.keys(fieldMapping).length);
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
          [ValidationKeys.DIFF]: sf(
            COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_EXIST,
            "stringValue"
          ),
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
          Model.fromObject(this, model);
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
          Model.fromObject(this, model);
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
          [ValidationKeys.LESS_THAN]: sf(
            COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_EXIST,
            "invalidField"
          ),
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
          Model.fromObject(this, model);
        }
      }

      @model()
      class MultiTypeGreaterThanModel extends Model {
        @gt("mirror.mirrorNumberValue")
        numberValue: number = 0;

        @gt("mirror.mirrorDateValue")
        dateValue: Date = new Date();

        @type(MirrorTestModel)
        mirror?: MirrorTestModel;

        constructor(model?: ModelArg<MultiTypeGreaterThanModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class InvalidPropertyModel extends Model {
        @gt("mirror.inexistentField")
        numberValue: number = 0;

        @type(MirrorTestModel)
        mirror?: MirrorTestModel;

        constructor(model?: ModelArg<InvalidPropertyModel>) {
          super();
          Model.fromObject(this, model);
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
          [ValidationKeys.GREATER_THAN]: sf(
            COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_EXIST,
            "inexistentField"
          ),
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
          Model.fromObject(this, model);
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
          Model.fromObject(this, model);
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
          Model.fromObject(this, model);
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
          [ValidationKeys.GREATER_THAN_OR_EQUAL]: sf(
            COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_EXIST,
            "invalidField"
          ),
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
          Model.fromObject(this, model);
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
          Model.fromObject(this, model);
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
          Model.fromObject(this, model);
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
          [ValidationKeys.LESS_THAN_OR_EQUAL]: sf(
            COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_EXIST,
            "invalidField"
          ),
        });
        expect(Object.keys(errors || {}).length).toEqual(1);
      });
    });
  });

  describe("Parent Comparison", () => {
    class ModelBuilder<T> {
      private readonly initialInstance: any;
      private instance?: T;

      constructor(
        private readonly Clazz: any,
        baseInstance?: any
      ) {
        this.initialInstance = ModelBuilder.deepCopy(baseInstance);
        this.reset();
      }

      reset() {
        this.instance = new (this.Clazz as any)(this.initialInstance);
        return this;
      }

      set(path: string, value: any): this {
        const parts = path.split(".");
        const lastKey = parts.pop()!;

        const target = parts.reduce((acc, key) => {
          if (!(key in acc))
            throw new Error(`Path error: '${key}' does not exist`);
          return acc[key];
        }, this.instance as any);

        if (!(lastKey in target))
          throw new Error(`Path error: '${lastKey}' does not exist`);

        target[lastKey] = value;
        return this;
      }

      get(): T {
        return this.instance as T;
      }

      static deepCopy<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
      }
    }

    describe("Equals Validator", () => {
      @model()
      class EqChildModel extends Model {
        @required()
        @eq("../parentName")
        childName: string = "";

        @required()
        @eq("../parentNumber")
        childNumber: number = 0;

        @required()
        @eq("../../grandparentBoolean")
        childBoolean: boolean = false;

        constructor(model?: ModelArg<EqChildModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class EqChildModel2 extends Model {
        @required()
        @eq("../parentArray.1")
        parentArrayElement: number = 0;

        @required()
        @eq("../../grandparentArray")
        @list([String, Number])
        grandchildArray: string[] = [];

        @required()
        @eq("../../grandparentObject")
        childObject: Record<string, any> = {};

        constructor(model?: ModelArg<EqChildModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class EqParentModel extends Model {
        @required()
        parentName: string = "";

        @required()
        @eq("../grandparentNumber")
        parentNumber!: number;

        @required()
        @list([String, Number])
        parentArray: string[] = [];

        @required()
        child: EqChildModel = new EqChildModel();

        @required()
        child2: EqChildModel2 = new EqChildModel2();

        constructor(model?: ModelArg<EqParentModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class EqGrandparentModel extends Model {
        @required()
        grandparentName: string = "";

        @required()
        grandparentNumber!: number;

        @required()
        grandparentBoolean: boolean = true;

        @required()
        @list([String, Number])
        grandparentArray: string[] = [];

        @required()
        grandparentObject: Record<string, any> = {};

        @required()
        parent: EqParentModel = new EqParentModel();

        constructor(model?: ModelArg<EqGrandparentModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      const equalInitialInstance = new EqGrandparentModel({
        grandparentName: "Grandparent",
        grandparentNumber: 8000,
        grandparentBoolean: false,
        grandparentArray: ["Grandparent", 1, 2, 3],
        grandparentObject: {
          city: "Mobile",
          state: "Alabama",
          zip: "100077",
        },
        parent: new EqParentModel({
          parentName: "Parent",
          parentNumber: 8000,
          parentArray: ["Parent", -9999, 2, 3],
          child: new EqChildModel({
            childName: "Parent",
            childNumber: 8000,
            childBoolean: false,
          }),
          child2: new EqChildModel2({
            parentArrayElement: -9999,
            grandchildArray: ["Grandparent", 1, 2, 3],
            childObject: {
              city: "Mobile",
              state: "Alabama",
              zip: "100077",
            },
          }),
        }),
      });

      it("should pass validation for all parent supported types", () => {
        const model = new ModelBuilder<EqGrandparentModel>(
          EqGrandparentModel,
          equalInitialInstance
        ).get();
        expect(model.hasErrors()).toBeUndefined();
      });

      it("should pass when the compared fields are both undefined", () => {
        const model = new EqGrandparentModel({
          grandparentNumber: undefined,
          parent: new EqParentModel({
            parentNumber: undefined,
          }),
        });

        const errors = model.hasErrors() as Record<string, any>;
        expect(model.grandparentNumber).toBeUndefined();
        expect(model.parent.parentNumber).toBeUndefined();
        expect(errors["parent.parentNumber"]).toBeDefined();
        expect(
          Object.prototype.hasOwnProperty.call(
            errors["parent.parentNumber"],
            ValidationKeys.EQUALS
          )
        ).toBeFalsy();
        expect(
          Object.prototype.hasOwnProperty.call(
            errors["parent.parentNumber"],
            ValidationKeys.REQUIRED
          )
        ).toBeTruthy();
        expect(
          Object.prototype.hasOwnProperty.call(
            errors.grandparentNumber,
            ValidationKeys.REQUIRED
          )
        ).toBeTruthy();
      });

      it("should fail when properties mismatch from parent/grandparent values", () => {
        // childName !== parentName
        const model = new ModelBuilder<EqGrandparentModel>(
          EqGrandparentModel,
          equalInitialInstance
        ).set("parent.child.childName", "WrongName");
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childName": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../parentName",
            },
          })
        );

        // childNumber !== parentNumber
        model.reset().set("parent.child.childNumber", 9999);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childNumber": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../parentNumber",
            },
          })
        );

        // parentNumber !== grandparentNumber
        model.reset().set("parent.parentNumber", Math.random());
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childNumber": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../parentNumber",
            },
            "parent.parentNumber": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../grandparentNumber",
            },
          })
        );

        // childNumber !== parentNumber !== grandparentNumber
        model
          .reset()
          .set("grandparentNumber", 10 + Math.random())
          .set("parent.child.childNumber", 1000 + Math.random());
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.parentNumber": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../grandparentNumber",
            },
            "parent.child.childNumber": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../parentNumber",
            },
          })
        );

        // childBoolean !== grandparentBoolean
        model.reset().set("parent.child.childBoolean", true);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childBoolean": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../../grandparentBoolean",
            },
          })
        );

        // parentArrayElement !== parentArray.1
        model.reset().set("parent.child2.parentArrayElement", Math.random());
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child2.parentArrayElement": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../parentArray.1",
            },
          })
        );

        // grandchildArray !== grandparentArray -> mismatch element
        model.reset().set("parent.child2.grandchildArray", ["wrong", 1, 2, 3]);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child2.grandchildArray": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../../grandparentArray",
            },
          })
        );

        // grandchildArray !== grandparentArray -> mismatch length
        model.reset().set("parent.child2.grandchildArray", ["wrong"]);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child2.grandchildArray": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../../grandparentArray",
            },
          })
        );

        // childObject !== grandparentObject -> mismatch key
        model.reset().set("parent.child2.childObject", {
          city: "Mobile",
          state: "Alabama",
          zip: "900077",
        });
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child2.childObject": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../../grandparentObject",
            },
          })
        );

        // childObject !== grandparentObject -> mismatch object
        model.reset().set("parent.child2.childObject", {
          city: "Fake",
          state: "Nowhere",
          zip: "00000",
        });
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child2.childObject": {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../../grandparentObject",
            },
          })
        );
      });
    });

    describe("Diff Validator", () => {
      @model()
      class DiffChildModel extends Model {
        @required()
        @diff("../parentName")
        childName: string = "";

        @required()
        @diff("../parentNumber")
        childNumber: number = 0;

        @required()
        @diff("../../grandparentBoolean")
        childBoolean: boolean = false;

        constructor(model?: ModelArg<DiffChildModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class DiffChildModel2 extends Model {
        @required()
        @diff("../parentArray.1")
        parentArrayElement: number = 0;

        @required()
        @diff("../../grandparentArray")
        @list([String, Number])
        grandchildArray: string[] = [];

        @required()
        @diff("../../grandparentObject")
        childObject: Record<string, any> = {};

        constructor(model?: ModelArg<DiffChildModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class DiffParentModel extends Model {
        @required()
        parentName: string = "";

        @required()
        @diff("../grandparentNumber")
        parentNumber!: number;

        @required()
        @list([String, Number])
        parentArray: string[] = [];

        @required()
        child: DiffChildModel = new DiffChildModel();

        @required()
        child2: DiffChildModel2 = new DiffChildModel2();

        constructor(model?: ModelArg<DiffParentModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class DiffGrandparentModel extends Model {
        @required()
        grandparentName: string = "";

        @required()
        grandparentNumber!: number;

        @required()
        grandparentBoolean: boolean = true;

        @required()
        @list([String, Number])
        grandparentArray: string[] = [];

        @required()
        grandparentObject: Record<string, any> = {};

        @required()
        parent: DiffParentModel = new DiffParentModel();

        constructor(model?: ModelArg<DiffGrandparentModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      const diffInitialInstance = new DiffGrandparentModel({
        grandparentName: "Grandparent",
        grandparentNumber: 1000,
        grandparentBoolean: false,
        grandparentArray: ["Grandparent", 1, 2, 3],
        grandparentObject: {
          city: "Mobile",
          state: "Alabama",
          zip: "100077",
        },
        parent: new DiffParentModel({
          parentName: "Parent",
          parentNumber: 2000,
          parentArray: ["Parent", 100000, 2, 3],
          child: new DiffChildModel({
            childName: "ParentDiff",
            childNumber: 3000,
            childBoolean: true,
          }),
          child2: new DiffChildModel2({
            parentArrayElement: 5000,
            grandchildArray: ["GrandparentDiff", 1, 2, 3],
            childObject: {
              city: "Detroit",
              state: "Lamas",
              zip: "100077",
            },
          }),
        }),
      });

      it("should pass validation for all parent supported types", () => {
        const model = new ModelBuilder<DiffGrandparentModel>(
          DiffGrandparentModel,
          diffInitialInstance
        ).get();
        expect(model.hasErrors()).toBeUndefined();
      });

      it("should pass when one of the compared fields is undefined", () => {
        const model = new DiffGrandparentModel({
          parent: new DiffParentModel({ parentNumber: 1000 }),
        });

        const errors = model.hasErrors() as Record<string, any>;
        expect(model.grandparentNumber).toBeUndefined();
        expect(model.parent.parentNumber).toBeDefined();
        expect(errors["parent.parentNumber"]).toBeUndefined();
        expect(
          Object.prototype.hasOwnProperty.call(
            errors.grandparentNumber,
            ValidationKeys.REQUIRED
          )
        ).toBeTruthy();
      });

      it("should fail when properties match from parent/grandparent values", () => {
        // childName === parentName
        const model = new ModelBuilder<DiffGrandparentModel>(
          DiffGrandparentModel,
          diffInitialInstance
        ).set("parent.child.childName", "Parent");

        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childName": {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../parentName`,
            },
          })
        );

        // childNumber === parentNumber
        model
          .reset()
          .set("parent.child.childNumber", 2000)
          .set("parent.parentNumber", 2000);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childNumber": {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../parentNumber`,
            },
          })
        );

        // parentNumber === grandparentNumber
        model
          .reset()
          .set("parent.parentNumber", 1000)
          .set("grandparentNumber", 1000);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.parentNumber": {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../grandparentNumber`,
            },
          })
        );

        // childNumber === parentNumber === grandparentNumber
        model
          .reset()
          .set("parent.child.childNumber", 20)
          .set("parent.parentNumber", 20)
          .set("grandparentNumber", 20);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.parentNumber": {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../grandparentNumber`,
            },
            "parent.child.childNumber": {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../parentNumber`,
            },
          })
        );

        // childBoolean === grandparentBoolean
        model
          .reset()
          .set("grandparentBoolean", false)
          .set("parent.child.childBoolean", false);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childBoolean": {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../../grandparentBoolean`,
            },
          })
        );

        // parentArrayElement === parentArray.1
        const r = Math.random();
        model
          .reset()
          .set("parent.parentArray", [1, r, 3, 4])
          .set("parent.child2.parentArrayElement", r);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child2.parentArrayElement": {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../parentArray.1`,
            },
          })
        );

        // grandchildArray === grandparentArray
        model
          .reset()
          .set("parent.child2.grandchildArray", [10, 20, 30])
          .set("grandparentArray", [10, 20, 30]);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child2.grandchildArray": {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../../grandparentArray`,
            },
          })
        );

        // childObject !== grandparentObject
        const obj = {
          city: "Mobile",
          state: "Alabama",
          zip: "900077",
        };

        model
          .reset()
          .set("parent.child2.childObject", obj)
          .set("grandparentObject", obj);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child2.childObject": {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../../grandparentObject`,
            },
          })
        );
      });
    });

    describe("LessThan Validator", () => {
      @model()
      class LtChildModel extends Model {
        @required()
        @lt("../parentNumber")
        childNumber: number = 0;

        @required()
        @date()
        @lt("../../grandparentDate")
        childDate: Date = new Date();

        constructor(model?: ModelArg<LtChildModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class LtParentModel extends Model {
        @required()
        @lt("../grandparentNumber")
        parentNumber!: number;

        @required()
        child: LtChildModel = new LtChildModel();

        constructor(model?: ModelArg<LtParentModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class LtGrandparentModel extends Model {
        @required()
        grandparentNumber!: number;

        @required()
        @date()
        grandparentDate: Date = new Date();

        @required()
        parent: LtParentModel = new LtParentModel();

        constructor(model?: ModelArg<LtGrandparentModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      const ltInitialInstance = new LtGrandparentModel({
        grandparentNumber: 1000,
        grandparentDate: futureDate,
        parent: new LtParentModel({
          parentNumber: 500,
          parentDate: initialDate,
          child: new LtChildModel({
            childNumber: 200,
            childDate: pastDate,
          }),
        }),
      });

      it("should pass validation when values are less than reference", () => {
        const model = new ModelBuilder<LtGrandparentModel>(
          LtGrandparentModel,
          ltInitialInstance
        ).get();
        expect(model.hasErrors()).toBeUndefined();
      });

      it("should fail when one of the compared fields is undefined", () => {
        const model = new LtGrandparentModel({
          parent: new LtParentModel({ parentNumber: 1000 }),
        });

        const errors = model.hasErrors() as Record<string, any>;
        expect(model.grandparentNumber).toBeUndefined();
        expect(model.parent.parentNumber).toBeDefined();
        expect(errors["parent.parentNumber"]).toEqual({
          [ValidationKeys.LESS_THAN]:
            COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON,
        });
        expect(
          Object.prototype.hasOwnProperty.call(
            errors.grandparentNumber,
            ValidationKeys.REQUIRED
          )
        ).toBeTruthy();
      });

      it("should fail when child values are not less than parent values", () => {
        // childNumber === parentNumber
        const model = new ModelBuilder<LtGrandparentModel>(
          LtGrandparentModel,
          ltInitialInstance
        )
          .set("parent.child.childNumber", 500)
          .set("parent.parentNumber", 500);

        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childNumber": {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../parentNumber",
            },
          })
        );

        // childNumber >= parentNumber
        model
          .reset()
          .set("parent.child.childNumber", 600)
          .set("parent.parentNumber", 500);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childNumber": {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../parentNumber",
            },
          })
        );

        // childNumber === parentNumber === grandparentNumber
        model
          .reset()
          .set("parent.child.childNumber", 500)
          .set("parent.parentNumber", 500)
          .set("grandparentNumber", 500);

        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.parentNumber": {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../grandparentNumber",
            },
            "parent.child.childNumber": {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../parentNumber",
            },
          })
        );

        // childDate === grandparentDate
        model
          .reset()
          .set("parent.child.childDate", initialDate)
          .set("grandparentDate", initialDate);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childDate": {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../../grandparentDate",
            },
          })
        );

        // childDate >= grandparentDate
        model
          .reset()
          .set("parent.child.childDate", initialDate)
          .set("grandparentDate", pastDate);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childDate": {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../../grandparentDate",
            },
          })
        );

        // parentNumber >= grandparentNumber
        model
          .reset()
          .set("parent.parentNumber", 1001)
          .set("grandparentNumber", 1000);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.parentNumber": {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../grandparentNumber",
            },
          })
        );

        model
          .reset()
          .set("parent.parentNumber", 1500)
          .set("grandparentNumber", 1500);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.parentNumber": {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../grandparentNumber",
            },
          })
        );
      });

      it("should validate all LessThanError cases", () => {
        @model()
        class TestModel extends Model {
          @required()
          comparisonValue!: number;

          @lt("comparisonValue")
          testValue!: string;

          constructor(model?: ModelArg<TestModel>) {
            super();
            Model.fromObject(this, model);
          }
        }

        @model()
        class TestModelNumber extends Model {
          @required()
          @type([Number.name, BigInt.name])
          comparisonValue!: number;

          @type([Number.name, BigInt.name])
          @lt("comparisonValue")
          testValue!: number;

          constructor(model?: ModelArg<TestModelNumber>) {
            super();
            Model.fromObject(this, model);
          }
        }

        // null/undefined values
        const nullModel = new TestModel({
          testValue: "10",
        });
        const errors = nullModel.hasErrors();
        expect(errors).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.REQUIRED]: "This field is required",
            },
            testValue: {
              [ValidationKeys.LESS_THAN]: expect.stringContaining(
                COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON
              ),
            },
          })
        );

        // diff type
        const typeMismatchModel = new TestModel({
          testValue: "string",
          comparisonValue: 10,
        });
        expect(typeMismatchModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            testValue: {
              [ValidationKeys.LESS_THAN]: expect.stringContaining(
                sf(
                  COMPARISON_ERROR_MESSAGES.TYPE_MISMATCH_COMPARISON,
                  typeof typeMismatchModel.testValue,
                  typeof typeMismatchModel.comparisonValue
                )
              ),
            },
          })
        );

        // NaN values
        const nanModel = new TestModel({
          testValue: NaN,
          comparisonValue: 10,
        });
        expect(nanModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received number",
              [ValidationKeys.LESS_THAN]: expect.stringContaining(
                COMPARISON_ERROR_MESSAGES.NAN_COMPARISON
              ),
            },
          })
        );

        // invalid Dates
        const invalidDateModel = new TestModel({
          testValue: new Date("invalid"),
          comparisonValue: new Date(),
        });
        expect(invalidDateModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected Number, received object",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received object",
              [ValidationKeys.LESS_THAN]:
                COMPARISON_ERROR_MESSAGES.INVALID_DATE_COMPARISON,
            },
          })
        );

        // unsupported types
        const unsupportedTypeModel = new TestModel({
          testValue: { object: true },
          comparisonValue: { object: true },
        });
        expect(unsupportedTypeModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected Number, received object",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received object",
              [ValidationKeys.LESS_THAN]: sf(
                COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
                typeof unsupportedTypeModel.testValue,
                typeof unsupportedTypeModel.comparisonValue
              ),
            },
          })
        );

        // bigInt and Number comparison (should work)
        const bigIntModel = new TestModelNumber({
          testValue: BigInt(5),
          comparisonValue: 10,
        });
        expect(bigIntModel.hasErrors()).toBeUndefined();

        // number and BigInt comparison (should work)
        const numberModel = new TestModelNumber({
          testValue: 5,
          comparisonValue: BigInt(10),
        });
        expect(numberModel.hasErrors()).toBeUndefined();
      });
    });

    describe("LessThanOrEqual Validator", () => {
      @model()
      class LteChildModel extends Model {
        @required()
        @lte("../parentNumber")
        childNumber: number = 0;

        @required()
        @date()
        @lte("../../grandparentDate")
        childDate: Date = new Date();

        constructor(model?: ModelArg<LteChildModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class LteParentModel extends Model {
        @required()
        @lte("../grandparentNumber")
        parentNumber!: number;

        @required()
        child: LteChildModel = new LteChildModel();

        constructor(model?: ModelArg<LteParentModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class LteGrandparentModel extends Model {
        @required()
        grandparentNumber!: number;

        @required()
        @date()
        grandparentDate: Date = new Date();

        @required()
        parent: LteParentModel = new LteParentModel();

        constructor(model?: ModelArg<LteGrandparentModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      const lteInitialInstance = new LteGrandparentModel({
        grandparentNumber: 1000,
        grandparentDate: initialDate,
        parent: new LteParentModel({
          parentNumber: 1000,
          parentDate: initialDate,
          child: new LteChildModel({
            childNumber: 1000,
            childDate: initialDate,
          }),
        }),
      });

      it("should pass validation when values are equal or less than reference", () => {
        const model = new ModelBuilder<LteGrandparentModel>(
          LteGrandparentModel,
          lteInitialInstance
        ).get();
        expect(model.hasErrors()).toBeUndefined();
      });

      it("should fail when one of the compared fields is undefined", () => {
        const model = new LteGrandparentModel({
          parent: new LteParentModel({ parentNumber: 2000 }),
        });

        const errors = model.hasErrors() as Record<string, any>;
        expect(model.grandparentNumber).toBeUndefined();
        expect(model.parent.parentNumber).toBeDefined();
        expect(errors["parent.parentNumber"]).toEqual({
          [ValidationKeys.LESS_THAN_OR_EQUAL]:
            COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON,
        });
        expect(
          Object.prototype.hasOwnProperty.call(errors, "grandparentNumber")
        ).toBeTruthy();
      });

      it("should only pass when child values are less than or equal to parent values", () => {
        // childNumber === parentNumber
        const model = new ModelBuilder<LteGrandparentModel>(
          LteGrandparentModel,
          lteInitialInstance
        )
          .set("parent.child.childNumber", 500)
          .set("parent.parentNumber", 500);

        expect(model.get().hasErrors()).toBeUndefined();

        // childNumber >= parentNumber
        model
          .reset()
          .set("parent.child.childNumber", 600)
          .set("parent.parentNumber", 500);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childNumber": {
              [ValidationKeys.LESS_THAN_OR_EQUAL]:
                "This field must be less than or equal to field ../parentNumber",
            },
          })
        );

        // childNumber === parentNumber === grandparentNumber
        model
          .reset()
          .set("parent.child.childNumber", 500)
          .set("parent.parentNumber", 500)
          .set("grandparentNumber", 500);
        expect(model.get().hasErrors()).toBeUndefined();

        // childDate === grandparentDate
        model
          .reset()
          .set("parent.child.childDate", futureDate)
          .set("grandparentDate", futureDate);
        expect(model.get().hasErrors()).toBeUndefined();

        // childDate >= grandparentDate
        model
          .reset()
          .set("parent.child.childDate", initialDate)
          .set("grandparentDate", pastDate);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childDate": {
              [ValidationKeys.LESS_THAN_OR_EQUAL]:
                "This field must be less than or equal to field ../../grandparentDate",
            },
          })
        );

        // parentNumber >= grandparentNumber
        model
          .reset()
          .set("parent.parentNumber", 1001)
          .set("grandparentNumber", 1000);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.parentNumber": {
              [ValidationKeys.LESS_THAN_OR_EQUAL]:
                "This field must be less than or equal to field ../grandparentNumber",
            },
          })
        );

        model
          .reset()
          .set("parent.parentNumber", 1500)
          .set("grandparentNumber", 1500);
        expect(model.get().hasErrors()).toBeUndefined();
      });

      it("should validate all LessThanOrEqualError cases", () => {
        @model()
        class LteTestModel extends Model {
          @required()
          comparisonValue!: number;

          @lte("comparisonValue")
          testValue!: string;

          constructor(model?: ModelArg<LteTestModel>) {
            super();
            Model.fromObject(this, model);
          }
        }

        @model()
        class LteTestModelNumber extends Model {
          @required()
          @type([Number.name, BigInt.name])
          comparisonValue!: number;

          @lte("comparisonValue")
          @type([Number.name, BigInt.name])
          testValue!: number;

          constructor(model?: ModelArg<LteTestModelNumber>) {
            super();
            Model.fromObject(this, model);
          }
        }

        // null/undefined values
        const nullModel = new LteTestModel({
          testValue: 10,
        });
        expect(nullModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.REQUIRED]: "This field is required",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received number",
              [ValidationKeys.LESS_THAN_OR_EQUAL]: expect.stringContaining(
                COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON
              ),
            },
          })
        );

        // diff type
        const typeMismatchModel = new LteTestModel({
          testValue: new Date(),
          comparisonValue: 10,
        });
        expect(typeMismatchModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received object",
              [ValidationKeys.LESS_THAN_OR_EQUAL]: sf(
                COMPARISON_ERROR_MESSAGES.TYPE_MISMATCH_COMPARISON,
                typeof typeMismatchModel.testValue,
                typeof typeMismatchModel.comparisonValue
              ),
            },
          })
        );

        // NaN values
        const nanModel = new LteTestModel({
          testValue: NaN,
          comparisonValue: 10,
        });
        expect(nanModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received number",
              [ValidationKeys.LESS_THAN_OR_EQUAL]: sf(
                COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
                "NaN",
                typeof nanModel.comparisonValue
              ),
            },
          })
        );

        // invalid Dates
        const invalidDateModel = new LteTestModel({
          testValue: new Date("invalid"),
          comparisonValue: new Date(),
        });
        expect(invalidDateModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected Number, received object",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received object",
              [ValidationKeys.LESS_THAN_OR_EQUAL]:
                COMPARISON_ERROR_MESSAGES.INVALID_DATE_COMPARISON,
            },
          })
        );

        // unsupported types
        const unsupportedTypeModel = new LteTestModel({
          testValue: false,
          comparisonValue: true,
        });
        expect(unsupportedTypeModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected Number, received boolean",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received boolean",
              [ValidationKeys.LESS_THAN_OR_EQUAL]: sf(
                COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
                typeof unsupportedTypeModel.testValue,
                typeof unsupportedTypeModel.comparisonValue
              ),
            },
          })
        );

        // unsupported types when equal
        const unsupportedEqTypeModel = new LteTestModel({
          testValue: { object: true },
          comparisonValue: { object: true },
        });
        expect(unsupportedEqTypeModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected Number, received object",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received object",
              [ValidationKeys.LESS_THAN_OR_EQUAL]: sf(
                COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
                typeof unsupportedEqTypeModel.testValue,
                typeof unsupportedEqTypeModel.comparisonValue
              ),
            },
          })
        );

        // bigInt and Number comparison (should work)
        const bigIntModel = new LteTestModelNumber({
          testValue: BigInt(5),
          comparisonValue: 10,
        });
        expect(bigIntModel.hasErrors()).toBeUndefined();

        // number and BigInt comparison (should work)
        const numberModel = new LteTestModelNumber({
          testValue: 5,
          comparisonValue: BigInt(10),
        });
        expect(numberModel.hasErrors()).toBeUndefined();
      });
    });

    describe("GreaterThan Validator", () => {
      @model()
      class GtChildModel extends Model {
        @required()
        @gt("../parentNumber")
        childNumber: number = 0;

        @required()
        @date()
        @gt("../../grandparentDate")
        childDate: Date = new Date();

        constructor(model?: ModelArg<GtChildModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class GtParentModel extends Model {
        @required()
        @gt("../grandparentNumber")
        parentNumber!: number;

        @required()
        child: GtChildModel = new GtChildModel();

        constructor(model?: ModelArg<GtParentModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      @model()
      class GtGrandparentModel extends Model {
        @required()
        grandparentNumber!: number;

        @required()
        @date()
        grandparentDate: Date = new Date();

        @required()
        parent: GtParentModel = new GtParentModel();

        constructor(model?: ModelArg<GtGrandparentModel>) {
          super();
          Model.fromObject(this, model);
        }
      }

      const gtInitialInstance = new GtGrandparentModel({
        grandparentNumber: 100,
        grandparentDate: pastDate,
        parent: new GtParentModel({
          parentNumber: 500,
          parentDate: initialDate,
          child: new GtChildModel({
            childNumber: 1000,
            childDate: futureDate,
          }),
        }),
      });

      it("should pass validation when values are greater than reference", () => {
        const model = new ModelBuilder<GtGrandparentModel>(
          GtGrandparentModel,
          gtInitialInstance
        ).get();
        expect(model.hasErrors()).toBeUndefined();
      });

      it("should fail when one of the compared fields is undefined", () => {
        const model = new GtGrandparentModel({
          parent: new GtParentModel({ parentNumber: 1000 }),
        });

        const errors = model.hasErrors() as Record<string, any>;
        expect(model.grandparentNumber).toBeUndefined();
        expect(model.parent.parentNumber).toBeDefined();
        expect(errors["parent.parentNumber"]).toEqual({
          [ValidationKeys.GREATER_THAN]:
            COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON,
        });
        expect(
          Object.prototype.hasOwnProperty.call(errors, "grandparentNumber")
        ).toBeTruthy();
      });

      it("should fail when child values are not greater than parent values", () => {
        const model = new ModelBuilder<GtGrandparentModel>(
          GtGrandparentModel,
          gtInitialInstance
        )
          .set("parent.child.childNumber", 500)
          .set("parent.parentNumber", 500);

        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childNumber": {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../parentNumber",
            },
          })
        );

        model
          .reset()
          .set("parent.child.childNumber", 500)
          .set("parent.parentNumber", 600);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childNumber": {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../parentNumber",
            },
          })
        );

        model
          .reset()
          .set("parent.child.childNumber", 500)
          .set("parent.parentNumber", 500)
          .set("grandparentNumber", 500);

        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.parentNumber": {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../grandparentNumber",
            },
            "parent.child.childNumber": {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../parentNumber",
            },
          })
        );

        model
          .reset()
          .set("parent.child.childDate", initialDate)
          .set("grandparentDate", initialDate);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childDate": {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../../grandparentDate",
            },
          })
        );

        model
          .reset()
          .set("parent.child.childDate", pastDate)
          .set("grandparentDate", futureDate);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childDate": {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../../grandparentDate",
            },
          })
        );

        model
          .reset()
          .set("parent.child.childNumber", 1000)
          .set("parent.parentNumber", 900)
          .set("grandparentNumber", 901);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.parentNumber": {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../grandparentNumber",
            },
          })
        );

        model
          .reset()
          .set("parent.child.childNumber", 1000)
          .set("parent.parentNumber", 900)
          .set("grandparentNumber", 900);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.parentNumber": {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../grandparentNumber",
            },
          })
        );
      });

      it("should validate all GreaterThanError cases", () => {
        @model()
        class TestModel extends Model {
          @required()
          comparisonValue!: number;

          @gt("comparisonValue")
          testValue!: string;

          constructor(model?: ModelArg<TestModel>) {
            super();
            Model.fromModel(this, model);
          }
        }

        @model()
        class GteTestModelNumber extends Model {
          @required()
          @type([Number.name, BigInt.name])
          comparisonValue!: number;

          @gt("comparisonValue")
          @type([Number.name, BigInt.name])
          testValue!: string;

          constructor(model?: ModelArg<TestModel>) {
            super();
            Model.fromModel(this, model);
          }
        }

        const nullModel = new TestModel({
          testValue: 10,
        });
        expect(nullModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.REQUIRED]: "This field is required",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received number",
              [ValidationKeys.GREATER_THAN]: expect.stringContaining(
                COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON
              ),
            },
          })
        );

        const typeMismatchModel = new TestModel({
          testValue: "string",
          comparisonValue: 10,
        });
        expect(typeMismatchModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            testValue: {
              [ValidationKeys.GREATER_THAN]: expect.stringContaining(
                sf(
                  COMPARISON_ERROR_MESSAGES.TYPE_MISMATCH_COMPARISON,
                  typeof typeMismatchModel.testValue,
                  typeof typeMismatchModel.comparisonValue
                )
              ),
            },
          })
        );

        const nanModel = new TestModel({
          testValue: NaN,
          comparisonValue: 10,
        });
        expect(nanModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received number",
              [ValidationKeys.GREATER_THAN]:
                COMPARISON_ERROR_MESSAGES.NAN_COMPARISON,
            },
          })
        );

        const invalidDateModel = new TestModel({
          testValue: new Date("invalid"),
          comparisonValue: new Date(),
        });
        expect(invalidDateModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected Number, received object",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received object",
              [ValidationKeys.GREATER_THAN]:
                COMPARISON_ERROR_MESSAGES.INVALID_DATE_COMPARISON,
            },
          })
        );

        const unsupportedTypeModel = new TestModel({
          testValue: { object: true },
          comparisonValue: { object: true },
        });
        expect(unsupportedTypeModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected Number, received object",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received object",
              [ValidationKeys.GREATER_THAN]: sf(
                COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
                typeof unsupportedTypeModel.testValue,
                typeof unsupportedTypeModel.comparisonValue
              ),
            },
          })
        );

        const bigIntModel = new GteTestModelNumber({
          testValue: BigInt(10),
          comparisonValue: 5,
        });
        expect(bigIntModel.hasErrors()).toBeUndefined();

        const numberModel = new GteTestModelNumber({
          testValue: 10,
          comparisonValue: BigInt(5),
        });
        expect(numberModel.hasErrors()).toBeUndefined();
      });
    });

    describe("GreaterThanOrEqual Validator", () => {
      @model()
      class GteChildModel extends Model {
        @required()
        @gte("../parentNumber")
        childNumber: number = 0;

        @required()
        @date()
        @gte("../../grandparentDate")
        childDate: Date = new Date();

        constructor(model?: ModelArg<GteChildModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      @model()
      class GteParentModel extends Model {
        @required()
        @gte("../grandparentNumber")
        parentNumber: number = 100;

        @required()
        child: GteChildModel = new GteChildModel();

        constructor(model?: ModelArg<GteParentModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      @model()
      class GteGrandparentModel extends Model {
        @required()
        grandparentNumber!: number;

        @required()
        @date()
        grandparentDate: Date = new Date();

        @required()
        parent: GteParentModel = new GteParentModel();

        constructor(model?: ModelArg<GteGrandparentModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      const gteInitialInstance = new GteGrandparentModel({
        grandparentNumber: 1000,
        grandparentDate: initialDate,
        parent: new GteParentModel({
          parentNumber: 1000,
          parentDate: initialDate,
          child: new GteChildModel({
            childNumber: 1000,
            childDate: initialDate,
          }),
        }),
      });

      it("should pass validation when values are equal to reference", () => {
        const model = new ModelBuilder<GteGrandparentModel>(
          GteGrandparentModel,
          gteInitialInstance
        ).get();
        expect(model.hasErrors()).toBeUndefined();
      });

      it("should pass validation when values greater than reference", () => {
        const model = new ModelBuilder<GteGrandparentModel>(
          GteGrandparentModel,
          gteInitialInstance
        );
        model
          .set("parent.child.childNumber", 1000)
          .set("parent.parentNumber", 900)
          .set("grandparentNumber", 800);

        model
          .set("parent.child.childDate", futureDate)
          .set("grandparentDate", pastDate);

        expect(model.get().hasErrors()).toBeUndefined();
      });

      it("should fail when one of the compared fields is undefined", () => {
        const model = new GteGrandparentModel({
          parent: new GteParentModel({ parentNumber: 1000 }),
        });

        const errors = model.hasErrors() as Record<string, any>;
        expect(model.grandparentNumber).toBeUndefined();
        expect(model.parent.parentNumber).toBeDefined();
        expect(errors["parent.parentNumber"]).toEqual({
          [ValidationKeys.GREATER_THAN_OR_EQUAL]:
            COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON,
        });
        expect(
          Object.prototype.hasOwnProperty.call(
            errors.grandparentNumber,
            ValidationKeys.REQUIRED
          )
        ).toBeTruthy();
      });

      it("should fail when child values are not greater than parent values", () => {
        // childNumber === parentNumber
        const model = new ModelBuilder<GteGrandparentModel>(
          GteGrandparentModel,
          gteInitialInstance
        )
          .set("parent.child.childNumber", 1000)
          .set("parent.parentNumber", 1000);

        expect(model.get().hasErrors()).toBeUndefined();

        // childNumber <= parentNumber
        model
          .reset()
          .set("parent.child.childNumber", 200)
          .set("parent.parentNumber", 300)
          .set("grandparentNumber", 300);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childNumber": {
              [ValidationKeys.GREATER_THAN_OR_EQUAL]:
                "This field must be greater than or equal to field ../parentNumber",
            },
          })
        );

        // childNumber === parentNumber === grandparentNumber
        model
          .reset()
          .set("parent.child.childNumber", 500)
          .set("parent.parentNumber", 500)
          .set("grandparentNumber", 500);

        expect(model.get().hasErrors()).toBeUndefined();

        // childDate === grandparentDate
        model
          .reset()
          .set("parent.child.childDate", initialDate)
          .set("grandparentDate", initialDate);
        expect(model.get().hasErrors()).toBeUndefined();

        // childDate <= grandparentDate
        model
          .reset()
          .set("parent.child.childDate", pastDate)
          .set("grandparentDate", futureDate);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.child.childDate": {
              [ValidationKeys.GREATER_THAN_OR_EQUAL]:
                "This field must be greater than or equal to field ../../grandparentDate",
            },
          })
        );

        // parentNumber <= grandparentNumber
        model
          .reset()
          .set("parent.child.childNumber", 1000)
          .set("parent.parentNumber", 900)
          .set("grandparentNumber", 901);
        expect(model.get().hasErrors()).toEqual(
          new ModelErrorDefinition({
            "parent.parentNumber": {
              [ValidationKeys.GREATER_THAN_OR_EQUAL]:
                "This field must be greater than or equal to field ../grandparentNumber",
            },
          })
        );

        // parentNumber === grandparentNumber
        model
          .reset()
          .set("parent.child.childNumber", 1000)
          .set("parent.parentNumber", 900)
          .set("grandparentNumber", 900);
        expect(model.get().hasErrors()).toBeUndefined();
      });

      it("should validate all GreaterThanOrEqualError cases", () => {
        @model()
        class GteTestModel extends Model {
          @required()
          comparisonValue: number;

          @gte("comparisonValue")
          testValue: string;

          constructor(model?: ModelArg<GteTestModel>) {
            super();
            Model.fromModel(this, model);
          }
        }

        @model()
        class GteTestModelNumber extends Model {
          @required()
          @type([Number.name, BigInt.name])
          comparisonValue!: number;

          @gte("comparisonValue")
          @type([Number.name, BigInt.name])
          testValue!: string;

          constructor(model?: ModelArg<GteTestModelNumber>) {
            super();
            Model.fromModel(this, model);
          }
        }

        // null/undefined values
        const nullModel = new GteTestModel({
          testValue: 10,
        });
        expect(nullModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.REQUIRED]: "This field is required",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received number",
              [ValidationKeys.GREATER_THAN_OR_EQUAL]: expect.stringContaining(
                COMPARISON_ERROR_MESSAGES.NULL_OR_UNDEFINED_COMPARISON
              ),
            },
          })
        );

        // diff type
        const typeMismatchModel = new GteTestModel({
          testValue: new Date(),
          comparisonValue: 10,
        });
        expect(typeMismatchModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received object",
              [ValidationKeys.GREATER_THAN_OR_EQUAL]: sf(
                COMPARISON_ERROR_MESSAGES.TYPE_MISMATCH_COMPARISON,
                typeof typeMismatchModel.testValue,
                typeof typeMismatchModel.comparisonValue
              ),
            },
          })
        );

        // NaN values
        const nanModel = new GteTestModel({
          testValue: NaN,
          comparisonValue: 10,
        });
        expect(nanModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received number",
              [ValidationKeys.GREATER_THAN_OR_EQUAL]: sf(
                COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
                "NaN",
                typeof nanModel.comparisonValue
              ),
            },
          })
        );

        // invalid Dates
        const invalidDateModel = new GteTestModel({
          testValue: new Date("invalid"),
          comparisonValue: new Date(),
        });
        expect(invalidDateModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected Number, received object",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received object",
              [ValidationKeys.GREATER_THAN_OR_EQUAL]:
                COMPARISON_ERROR_MESSAGES.INVALID_DATE_COMPARISON,
            },
          })
        );

        // unsupported types
        const unsupportedTypeModel = new GteTestModel({
          testValue: true,
          comparisonValue: false,
        });
        expect(unsupportedTypeModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected Number, received boolean",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received boolean",
              [ValidationKeys.GREATER_THAN_OR_EQUAL]: sf(
                COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
                typeof unsupportedTypeModel.testValue,
                typeof unsupportedTypeModel.comparisonValue
              ),
            },
          })
        );

        // should throw when unsupported type even when values are equal
        const unsupportedEqTypeModel = new GteTestModel({
          testValue: { object: true },
          comparisonValue: { object: true },
        });
        expect(unsupportedEqTypeModel.hasErrors()).toEqual(
          new ModelErrorDefinition({
            comparisonValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected Number, received object",
            },
            testValue: {
              [ValidationKeys.TYPE]:
                "Invalid type. Expected String, received object",
              [ValidationKeys.GREATER_THAN_OR_EQUAL]: sf(
                COMPARISON_ERROR_MESSAGES.UNSUPPORTED_TYPES_COMPARISON,
                typeof unsupportedEqTypeModel.testValue,
                typeof unsupportedEqTypeModel.comparisonValue
              ),
            },
          })
        );

        // bigInt and Number comparison (should work)
        const bigIntModel = new GteTestModelNumber({
          testValue: BigInt(10),
          comparisonValue: 5,
        });
        expect(bigIntModel.hasErrors()).toBeUndefined();

        // number and BigInt comparison (should work)
        const numberModel = new GteTestModelNumber({
          testValue: 10,
          comparisonValue: BigInt(5),
        });
        expect(numberModel.hasErrors()).toBeUndefined();
      });
    });
  });

  describe("Bidirectional Comparison", () => {
    @model()
    class BidirectionalChildModel extends Model {
      @required()
      @eq("../parentName")
      childName: string = "";

      @required()
      @diff("../parentNumber")
      childNumber: number = 0;

      @required()
      @date()
      @lt("../parentDate")
      childDate: Date = new Date();

      constructor(model?: ModelArg<BidirectionalChildModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    @model()
    class BidirectionalParentModel extends Model {
      @required()
      @eq("child.childName")
      parentName: string = "";

      @required()
      @diff("child.childNumber")
      parentNumber: number = 0;

      @required()
      @date()
      @gt("child.childDate")
      parentDate: Date = new Date();

      @required()
      @type(BidirectionalChildModel.name)
      child: BidirectionalChildModel = new BidirectionalChildModel();

      constructor(model?: ModelArg<BidirectionalParentModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    it("should pass validations", () => {
      const model = new BidirectionalParentModel({
        parentName: "Parent",
        parentNumber: 100,
        parentDate: futureDate,
        child: new BidirectionalChildModel({
          childName: "Parent",
          childNumber: 200,
          childDate: pastDate,
        }),
      });

      const errors = model.hasErrors();
      expect(errors).toBeUndefined();
    });

    it("should fail validations", () => {
      const model = new BidirectionalParentModel({
        parentName: "Parent",
        parentNumber: 100,
        parentDate: pastDate,
        child: new BidirectionalChildModel({
          childName: "Wrong",
          childNumber: 100,
          childDate: pastDate,
        }),
      });

      expect(model.hasErrors()).toEqual(
        new ModelErrorDefinition({
          parentName: {
            [ValidationKeys.EQUALS]:
              "This field must be equal to field child.childName",
          },
          parentNumber: {
            [ValidationKeys.DIFF]:
              "This field must be different from field child.childNumber",
          },
          parentDate: {
            [ValidationKeys.GREATER_THAN]:
              "This field must be greater than field child.childDate",
          },
          "child.childName": {
            [ValidationKeys.EQUALS]:
              "This field must be equal to field ../parentName",
          },
          "child.childNumber": {
            [ValidationKeys.DIFF]:
              "This field must be different from field ../parentNumber",
          },
          "child.childDate": {
            [ValidationKeys.LESS_THAN]:
              "This field must be less than field ../parentDate",
          },
        })
      );
    });
  });

  describe("Conflicting Comparison", () => {
    @model()
    class ConflictingChildModel extends Model {
      @required()
      @eq("../parentValue") // Requires to be EQUAL to parent value
      childValue: string = "";

      constructor(model?: ModelArg<ConflictingChildModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    @model()
    class ConflictingParentModel extends Model {
      @required()
      @diff("child.childValue") // Requires to be DIFFERENT from the child value
      parentValue: string = "";

      @required()
      @type(ConflictingChildModel.name)
      child: ConflictingChildModel = new ConflictingChildModel();

      constructor(model?: ModelArg<ConflictingParentModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    it("should always fail when validations conflict (eq in child vs diff in parent)", () => {
      // equal values (should fail for parent)
      const model1 = new ConflictingParentModel({
        parentValue: "testValue",
        child: new ConflictingChildModel({
          childValue: "testValue",
        }),
      });

      expect(model1.hasErrors()).toEqual({
        parentValue: {
          [ValidationKeys.DIFF]:
            "This field must be different from field child.childValue",
        },
        // Child has no error because it matches the parent
      });

      // different values (should fail for child)
      const model2 = new ConflictingParentModel({
        parentValue: "value1",
        child: new ConflictingChildModel({
          childValue: "value2",
        }),
      });

      expect(model2.hasErrors()).toEqual(
        new ModelErrorDefinition({
          "child.childValue": {
            [ValidationKeys.EQUALS]:
              "This field must be equal to field ../parentValue",
          },
          // Parent has no error because it differs from the child
        })
      );
    });
  });
});
