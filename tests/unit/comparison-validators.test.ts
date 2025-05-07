import {
  date,
  diff,
  eq,
  gt,
  gte,
  lt,
  lte,
  model,
  Model,
  ModelArg,
  required,
  ValidationKeys,
} from "../../src";

describe("Comparison Validators", () => {
  const initialDate = new Date();
  const pastDate = new Date(initialDate.getTime() - 86400000); // 1d before
  const futureDate = new Date(initialDate.getTime() + 86400000); // 1d after

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
        Model.fromModel(this, model);
      }
    }

    @model()
    class EqChildModel2 extends Model {
      @required()
      @eq("../parentArray.1")
      parentArrayElement: number = 0;

      @required()
      @eq("../../grandparentArray")
      grandchildArray: string[] = [];

      @required()
      @eq("../../grandparentObject")
      childObject: Record<string, any> = {};

      constructor(model?: ModelArg<EqChildModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    @model()
    class EqParentModel extends Model {
      @required()
      parentName: string = "";

      @required()
      @eq("../grandparentNumber")
      parentNumber: number = 100;

      @required()
      parentArray: string[] = [];

      @required()
      child: EqChildModel = new EqChildModel();

      @required()
      child2: EqChildModel2 = new EqChildModel2();

      constructor(model?: ModelArg<EqParentModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    @model()
    class EqGrandparentModel extends Model {
      @required()
      grandparentName: string = "";

      @required()
      grandparentNumber: number = 1000;

      @required()
      grandparentBoolean: boolean = true;

      @required()
      grandparentArray: string[] = [];

      @required()
      grandparentObject: Record<string, any> = {};

      @required()
      parent: EqParentModel = new EqParentModel();

      constructor(model?: ModelArg<EqGrandparentModel>) {
        super();
        Model.fromModel(this, model);
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
        parent: new EqParentModel({}),
      });

      const errors = model.hasErrors() as Record<string, any>;
      expect(model.grandparentNumber).toBeUndefined();
      expect(model.parent.parentNumber).toBeUndefined();
      expect(errors.parent.parentNumber).toBeDefined();
      expect(
        Object.prototype.hasOwnProperty.call(
          errors.parent.parentNumber,
          ValidationKeys.EQUALS
        )
      ).toBeFalsy();
      expect(
        Object.prototype.hasOwnProperty.call(
          errors.parent.parentNumber,
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
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childName: {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../parentName",
            },
          },
        },
      });

      // childNumber !== parentNumber
      model.reset().set("parent.child.childNumber", 9999);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childNumber: {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../parentNumber",
            },
          },
        },
      });

      // parentNumber !== grandparentNumber
      model.reset().set("parent.parentNumber", Math.random());
      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.EQUALS]:
              "This field must be equal to field ../grandparentNumber",
          },
          child: {
            childNumber: {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../parentNumber",
            },
          },
        },
      });

      // childNumber !== parentNumber !== grandparentNumber
      model
        .reset()
        .set("grandparentNumber", 10 + Math.random())
        .set("parent.child.childNumber", 1000 + Math.random());
      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.EQUALS]:
              "This field must be equal to field ../grandparentNumber",
          },
          child: {
            childNumber: {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../parentNumber",
            },
          },
        },
      });

      // childBoolean !== grandparentBoolean
      model.reset().set("parent.child.childBoolean", true);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childBoolean: {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../../grandparentBoolean",
            },
          },
        },
      });

      // parentArrayElement !== parentArray.1
      model.reset().set("parent.child2.parentArrayElement", Math.random());
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child2: {
            parentArrayElement: {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../parentArray.1",
            },
          },
        },
      });

      // grandchildArray !== grandparentArray -> mismatch element
      model.reset().set("parent.child2.grandchildArray", ["wrong", 1, 2, 3]);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child2: {
            grandchildArray: {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../../grandparentArray",
            },
          },
        },
      });

      // grandchildArray !== grandparentArray -> mismatch length
      model.reset().set("parent.child2.grandchildArray", ["wrong"]);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child2: {
            grandchildArray: {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../../grandparentArray",
            },
          },
        },
      });

      // childObject !== grandparentObject -> mismatch key
      model.reset().set("parent.child2.childObject", {
        city: "Mobile",
        state: "Alabama",
        zip: "900077",
      });
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child2: {
            childObject: {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../../grandparentObject",
            },
          },
        },
      });

      // childObject !== grandparentObject -> mismatch object
      model.reset().set("parent.child2.childObject", {
        city: "Fake",
        state: "Nowhere",
        zip: "00000",
      });
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child2: {
            childObject: {
              [ValidationKeys.EQUALS]:
                "This field must be equal to field ../../grandparentObject",
            },
          },
        },
      });
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
        Model.fromModel(this, model);
      }
    }

    @model()
    class DiffChildModel2 extends Model {
      @required()
      @diff("../parentArray.1")
      parentArrayElement: number = 0;

      @required()
      @diff("../../grandparentArray")
      grandchildArray: string[] = [];

      @required()
      @diff("../../grandparentObject")
      childObject: Record<string, any> = {};

      constructor(model?: ModelArg<DiffChildModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    @model()
    class DiffParentModel extends Model {
      @required()
      parentName: string = "";

      @required()
      @diff("../grandparentNumber")
      parentNumber: number = 100;

      @required()
      parentArray: string[] = [];

      @required()
      child: DiffChildModel = new DiffChildModel();

      @required()
      child2: DiffChildModel2 = new DiffChildModel2();

      constructor(model?: ModelArg<DiffParentModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    @model()
    class DiffGrandparentModel extends Model {
      @required()
      grandparentName: string = "";

      @required()
      grandparentNumber: number = 1000;

      @required()
      grandparentBoolean: boolean = true;

      @required()
      grandparentArray: string[] = [];

      @required()
      grandparentObject: Record<string, any> = {};

      @required()
      parent: DiffParentModel = new DiffParentModel();

      constructor(model?: ModelArg<DiffGrandparentModel>) {
        super();
        Model.fromModel(this, model);
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
      expect(errors.parent.parentNumber).toBeUndefined();
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

      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childName: {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../parentName`,
            },
          },
        },
      });

      // childNumber === parentNumber
      model
        .reset()
        .set("parent.child.childNumber", 2000)
        .set("parent.parentNumber", 2000);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childNumber: {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../parentNumber`,
            },
          },
        },
      });

      // parentNumber === grandparentNumber
      model
        .reset()
        .set("parent.parentNumber", 1000)
        .set("grandparentNumber", 1000);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../grandparentNumber`,
          },
        },
      });

      // childNumber === parentNumber === grandparentNumber
      model
        .reset()
        .set("parent.child.childNumber", 20)
        .set("parent.parentNumber", 20)
        .set("grandparentNumber", 20);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../grandparentNumber`,
          },
          child: {
            childNumber: {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../parentNumber`,
            },
          },
        },
      });

      // childBoolean === grandparentBoolean
      model
        .reset()
        .set("grandparentBoolean", false)
        .set("parent.child.childBoolean", false);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childBoolean: {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../../grandparentBoolean`,
            },
          },
        },
      });

      // parentArrayElement === parentArray.1
      const r = Math.random();
      model
        .reset()
        .set("parent.parentArray", [1, r, 3, 4])
        .set("parent.child2.parentArrayElement", r);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child2: {
            parentArrayElement: {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../parentArray.1`,
            },
          },
        },
      });

      // grandchildArray === grandparentArray
      model
        .reset()
        .set("parent.child2.grandchildArray", [10, 20, 30])
        .set("grandparentArray", [10, 20, 30]);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child2: {
            grandchildArray: {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../../grandparentArray`,
            },
          },
        },
      });

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
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child2: {
            childObject: {
              [ValidationKeys.DIFF]: `This field must be ${ValidationKeys.DIFF} from field ../../grandparentObject`,
            },
          },
        },
      });
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
        Model.fromModel(this, model);
      }
    }

    @model()
    class LtParentModel extends Model {
      @required()
      @lt("../grandparentNumber")
      parentNumber: number = 100;

      @required()
      child: LtChildModel = new LtChildModel();

      constructor(model?: ModelArg<LtParentModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    @model()
    class LtGrandparentModel extends Model {
      @required()
      grandparentNumber: number = 1000;

      @required()
      @date()
      grandparentDate: Date = new Date();

      @required()
      parent: LtParentModel = new LtParentModel();

      constructor(model?: ModelArg<LtGrandparentModel>) {
        super();
        Model.fromModel(this, model);
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
      expect(errors.parent?.parentNumber).toEqual({
        [ValidationKeys.LESS_THAN]: "Cannot compare null or undefined values",
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

      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childNumber: {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../parentNumber",
            },
          },
        },
      });

      // childNumber >= parentNumber
      model
        .reset()
        .set("parent.child.childNumber", 600)
        .set("parent.parentNumber", 500);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childNumber: {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../parentNumber",
            },
          },
        },
      });

      // childNumber === parentNumber === grandparentNumber
      model
        .reset()
        .set("parent.child.childNumber", 500)
        .set("parent.parentNumber", 500)
        .set("grandparentNumber", 500);

      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.LESS_THAN]:
              "This field must be less than field ../grandparentNumber",
          },
          child: {
            childNumber: {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../parentNumber",
            },
          },
        },
      });

      // childDate === grandparentDate
      model
        .reset()
        .set("parent.child.childDate", initialDate)
        .set("grandparentDate", initialDate);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childDate: {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../../grandparentDate",
            },
          },
        },
      });

      // childDate >= grandparentDate
      model
        .reset()
        .set("parent.child.childDate", initialDate)
        .set("grandparentDate", pastDate);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childDate: {
              [ValidationKeys.LESS_THAN]:
                "This field must be less than field ../../grandparentDate",
            },
          },
        },
      });

      // parentNumber >= grandparentNumber
      model
        .reset()
        .set("parent.parentNumber", 1001)
        .set("grandparentNumber", 1000);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.LESS_THAN]:
              "This field must be less than field ../grandparentNumber",
          },
        },
      });

      model
        .reset()
        .set("parent.parentNumber", 1500)
        .set("grandparentNumber", 1500);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.LESS_THAN]:
              "This field must be less than field ../grandparentNumber",
          },
        },
      });
    });

    it("should validate all LessThanError cases", () => {
      @model()
      class TestModel extends Model {
        @required()
        comparisonValue: any;

        @lt("comparisonValue")
        testValue: any;

        constructor(model?: ModelArg<TestModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      // null/undefined values
      const nullModel = new TestModel({
        testValue: 10,
      });
      expect(nullModel.hasErrors()).toEqual({
        comparisonValue: {
          [ValidationKeys.REQUIRED]: "This field is required",
        },
        testValue: {
          [ValidationKeys.LESS_THAN]: expect.stringContaining(
            "Cannot compare null or undefined values"
          ),
        },
      });

      // diff type
      const typeMismatchModel = new TestModel({
        testValue: "string",
        comparisonValue: 10,
      });
      expect(typeMismatchModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.LESS_THAN]: expect.stringContaining(
            "Cannot compare values of different types"
          ),
        },
      });

      // NaN values
      const nanModel = new TestModel({
        testValue: NaN,
        comparisonValue: 10,
      });
      expect(nanModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.LESS_THAN]: expect.stringContaining(
            "Cannot compare NaN values"
          ),
        },
      });

      // invalid Dates
      const invalidDateModel = new TestModel({
        testValue: new Date("invalid"),
        comparisonValue: new Date(),
      });
      expect(invalidDateModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.LESS_THAN]: expect.stringContaining(
            "Cannot compare invalid Date objects"
          ),
        },
      });

      // unsupported types
      const unsupportedTypeModel = new TestModel({
        testValue: { object: true },
        comparisonValue: { object: true },
      });
      expect(unsupportedTypeModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.LESS_THAN]: expect.stringContaining(
            "Unsupported types for lessThan comparison"
          ),
        },
      });

      // bigInt and Number comparison (should work)
      const bigIntModel = new TestModel({
        testValue: BigInt(5),
        comparisonValue: 10,
      });
      expect(bigIntModel.hasErrors()).toBeUndefined();

      // number and BigInt comparison (should work)
      const numberModel = new TestModel({
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
        Model.fromModel(this, model);
      }
    }

    @model()
    class LteParentModel extends Model {
      @required()
      @lte("../grandparentNumber")
      parentNumber: number = 100;

      @required()
      child: LteChildModel = new LteChildModel();

      constructor(model?: ModelArg<LteParentModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    @model()
    class LteGrandparentModel extends Model {
      @required()
      grandparentNumber: number = 1000;

      @required()
      @date()
      grandparentDate: Date = new Date();

      @required()
      parent: LteParentModel = new LteParentModel();

      constructor(model?: ModelArg<LteGrandparentModel>) {
        super();
        Model.fromModel(this, model);
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
      expect(errors.parent?.parentNumber).toEqual({
        [ValidationKeys.LESS_THAN_OR_EQUAL]:
          "Cannot compare null or undefined values",
      });
      expect(
        Object.prototype.hasOwnProperty.call(
          errors.grandparentNumber,
          ValidationKeys.REQUIRED
        )
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
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childNumber: {
              [ValidationKeys.LESS_THAN_OR_EQUAL]:
                "This field must be less than or equal to field ../parentNumber",
            },
          },
        },
      });

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
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childDate: {
              [ValidationKeys.LESS_THAN_OR_EQUAL]:
                "This field must be less than or equal to field ../../grandparentDate",
            },
          },
        },
      });

      // parentNumber >= grandparentNumber
      model
        .reset()
        .set("parent.parentNumber", 1001)
        .set("grandparentNumber", 1000);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.LESS_THAN_OR_EQUAL]:
              "This field must be less than or equal to field ../grandparentNumber",
          },
        },
      });

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
        comparisonValue: any;

        @lte("comparisonValue")
        testValue: any;

        constructor(model?: ModelArg<LteTestModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      // null/undefined values
      const nullModel = new LteTestModel({
        testValue: 10,
      });
      expect(nullModel.hasErrors()).toEqual({
        comparisonValue: {
          [ValidationKeys.REQUIRED]: "This field is required",
        },
        testValue: {
          [ValidationKeys.LESS_THAN_OR_EQUAL]: expect.stringContaining(
            "Cannot compare null or undefined values"
          ),
        },
      });

      // diff type
      const typeMismatchModel = new LteTestModel({
        testValue: "string",
        comparisonValue: 10,
      });
      expect(typeMismatchModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.LESS_THAN_OR_EQUAL]: expect.stringContaining(
            "Unsupported types for comparison: 'string' and 'number'"
          ),
        },
      });

      // NaN values
      const nanModel = new LteTestModel({
        testValue: NaN,
        comparisonValue: 10,
      });
      expect(nanModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.LESS_THAN_OR_EQUAL]: expect.stringContaining(
            "Cannot compare NaN values"
          ),
        },
      });

      // invalid Dates
      const invalidDateModel = new LteTestModel({
        testValue: new Date("invalid"),
        comparisonValue: new Date(),
      });
      expect(invalidDateModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.LESS_THAN_OR_EQUAL]: expect.stringContaining(
            "Cannot compare invalid Date objects"
          ),
        },
      });

      // unsupported types
      const unsupportedTypeModel = new LteTestModel({
        testValue: false,
        comparisonValue: true,
      });
      expect(unsupportedTypeModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.LESS_THAN_OR_EQUAL]: expect.stringContaining(
            "Unsupported types for comparison"
          ),
        },
      });

      // unsupported types when equal
      const unsupportedEqTypeModel = new LteTestModel({
        testValue: { object: true },
        comparisonValue: { object: true },
      });
      expect(unsupportedEqTypeModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.LESS_THAN_OR_EQUAL]: expect.stringContaining(
            "Unsupported types for comparison"
          ),
        },
      });

      // bigInt and Number comparison (should work)
      const bigIntModel = new LteTestModel({
        testValue: BigInt(5),
        comparisonValue: 10,
      });
      expect(bigIntModel.hasErrors()).toBeUndefined();

      // number and BigInt comparison (should work)
      const numberModel = new LteTestModel({
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
        Model.fromModel(this, model);
      }
    }

    @model()
    class GtParentModel extends Model {
      @required()
      @gt("../grandparentNumber")
      parentNumber: number = 100;

      @required()
      child: GtChildModel = new GtChildModel();

      constructor(model?: ModelArg<GtParentModel>) {
        super();
        Model.fromModel(this, model);
      }
    }

    @model()
    class GtGrandparentModel extends Model {
      @required()
      grandparentNumber: number = 1000;

      @required()
      @date()
      grandparentDate: Date = new Date();

      @required()
      parent: GtParentModel = new GtParentModel();

      constructor(model?: ModelArg<GtGrandparentModel>) {
        super();
        Model.fromModel(this, model);
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
      expect(errors.parent?.parentNumber).toEqual({
        [ValidationKeys.GREATER_THAN]:
          "Cannot compare null or undefined values",
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
      const model = new ModelBuilder<GtGrandparentModel>(
        GtGrandparentModel,
        gtInitialInstance
      )
        .set("parent.child.childNumber", 500)
        .set("parent.parentNumber", 500);

      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childNumber: {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../parentNumber",
            },
          },
        },
      });

      // childNumber <= parentNumber
      model
        .reset()
        .set("parent.child.childNumber", 500)
        .set("parent.parentNumber", 600);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childNumber: {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../parentNumber",
            },
          },
        },
      });

      // childNumber === parentNumber === grandparentNumber
      model
        .reset()
        .set("parent.child.childNumber", 500)
        .set("parent.parentNumber", 500)
        .set("grandparentNumber", 500);

      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.GREATER_THAN]:
              "This field must be greater than field ../grandparentNumber",
          },
          child: {
            childNumber: {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../parentNumber",
            },
          },
        },
      });

      // childDate === grandparentDate
      model
        .reset()
        .set("parent.child.childDate", initialDate)
        .set("grandparentDate", initialDate);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childDate: {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../../grandparentDate",
            },
          },
        },
      });

      // childDate <= grandparentDate
      model
        .reset()
        .set("parent.child.childDate", pastDate)
        .set("grandparentDate", futureDate);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childDate: {
              [ValidationKeys.GREATER_THAN]:
                "This field must be greater than field ../../grandparentDate",
            },
          },
        },
      });

      // parentNumber <= grandparentNumber
      model
        .reset()
        .set("parent.child.childNumber", 1000)
        .set("parent.parentNumber", 900)
        .set("grandparentNumber", 901);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.GREATER_THAN]:
              "This field must be greater than field ../grandparentNumber",
          },
        },
      });

      // parentNumber === grandparentNumber
      model
        .reset()
        .set("parent.child.childNumber", 1000)
        .set("parent.parentNumber", 900)
        .set("grandparentNumber", 900);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.GREATER_THAN]:
              "This field must be greater than field ../grandparentNumber",
          },
        },
      });
    });

    it("should validate all GreaterThanError cases", () => {
      @model()
      class TestModel extends Model {
        @required()
        comparisonValue: any;

        @gt("comparisonValue")
        testValue: any;

        constructor(model?: ModelArg<TestModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      // null/undefined values
      const nullModel = new TestModel({
        testValue: 10,
      });
      expect(nullModel.hasErrors()).toEqual({
        comparisonValue: {
          [ValidationKeys.REQUIRED]: "This field is required",
        },
        testValue: {
          [ValidationKeys.GREATER_THAN]: expect.stringContaining(
            "Cannot compare null or undefined values"
          ),
        },
      });

      // diff type
      const typeMismatchModel = new TestModel({
        testValue: "string",
        comparisonValue: 10,
      });
      expect(typeMismatchModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.GREATER_THAN]: expect.stringContaining(
            "Cannot compare values of different types"
          ),
        },
      });

      // NaN values
      const nanModel = new TestModel({
        testValue: NaN,
        comparisonValue: 10,
      });
      expect(nanModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.GREATER_THAN]: expect.stringContaining(
            "Cannot compare NaN values"
          ),
        },
      });

      // invalid Dates
      const invalidDateModel = new TestModel({
        testValue: new Date("invalid"),
        comparisonValue: new Date(),
      });
      expect(invalidDateModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.GREATER_THAN]: expect.stringContaining(
            "Cannot compare invalid date objects"
          ),
        },
      });

      // unsupported types
      const unsupportedTypeModel = new TestModel({
        testValue: { object: true },
        comparisonValue: { object: true },
      });
      expect(unsupportedTypeModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.GREATER_THAN]: expect.stringContaining(
            "Unsupported types for greaterThan comparison"
          ),
        },
      });

      // bigInt and Number comparison (should work)
      const bigIntModel = new TestModel({
        testValue: BigInt(10),
        comparisonValue: 5,
      });
      expect(bigIntModel.hasErrors()).toBeUndefined();

      // number and BigInt comparison (should work)
      const numberModel = new TestModel({
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
      grandparentNumber: number = 1000;

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
      expect(errors.parent?.parentNumber).toEqual({
        [ValidationKeys.GREATER_THAN_OR_EQUAL]:
          "Cannot compare null or undefined values",
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
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childNumber: {
              [ValidationKeys.GREATER_THAN_OR_EQUAL]:
                "This field must be greater than or equal to field ../parentNumber",
            },
          },
        },
      });

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
      expect(model.get().hasErrors()).toEqual({
        parent: {
          child: {
            childDate: {
              [ValidationKeys.GREATER_THAN_OR_EQUAL]:
                "This field must be greater than or equal to field ../../grandparentDate",
            },
          },
        },
      });

      // parentNumber <= grandparentNumber
      model
        .reset()
        .set("parent.child.childNumber", 1000)
        .set("parent.parentNumber", 900)
        .set("grandparentNumber", 901);
      expect(model.get().hasErrors()).toEqual({
        parent: {
          parentNumber: {
            [ValidationKeys.GREATER_THAN_OR_EQUAL]:
              "This field must be greater than or equal to field ../grandparentNumber",
          },
        },
      });

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
        comparisonValue: any;

        @gte("comparisonValue")
        testValue: any;

        constructor(model?: ModelArg<GteTestModel>) {
          super();
          Model.fromModel(this, model);
        }
      }

      // null/undefined values
      const nullModel = new GteTestModel({
        testValue: 10,
      });
      expect(nullModel.hasErrors()).toEqual({
        comparisonValue: {
          [ValidationKeys.REQUIRED]: "This field is required",
        },
        testValue: {
          [ValidationKeys.GREATER_THAN_OR_EQUAL]: expect.stringContaining(
            "Cannot compare null or undefined values"
          ),
        },
      });

      // diff type
      const typeMismatchModel = new GteTestModel({
        testValue: "string",
        comparisonValue: 10,
      });
      expect(typeMismatchModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.GREATER_THAN_OR_EQUAL]: expect.stringContaining(
            "Unsupported types for comparison: 'string' and 'number'"
          ),
        },
      });

      // NaN values
      const nanModel = new GteTestModel({
        testValue: NaN,
        comparisonValue: 10,
      });
      expect(nanModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.GREATER_THAN_OR_EQUAL]: expect.stringContaining(
            "Cannot compare NaN values"
          ),
        },
      });

      // invalid Dates
      const invalidDateModel = new GteTestModel({
        testValue: new Date("invalid"),
        comparisonValue: new Date(),
      });
      expect(invalidDateModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.GREATER_THAN_OR_EQUAL]: expect.stringContaining(
            "Cannot compare invalid date objects"
          ),
        },
      });

      // unsupported types
      const unsupportedTypeModel = new GteTestModel({
        testValue: true,
        comparisonValue: false,
      });
      expect(unsupportedTypeModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.GREATER_THAN_OR_EQUAL]: expect.stringContaining(
            "Unsupported types for comparison"
          ),
        },
      });

      // should throw when unsupported type even when values are equal
      const unsupportedEqTypeModel = new GteTestModel({
        testValue: { object: true },
        comparisonValue: { object: true },
      });
      expect(unsupportedEqTypeModel.hasErrors()).toEqual({
        testValue: {
          [ValidationKeys.GREATER_THAN_OR_EQUAL]: expect.stringContaining(
            "Unsupported types for comparison"
          ),
        },
      });

      // bigInt and Number comparison (should work)
      const bigIntModel = new GteTestModel({
        testValue: BigInt(10),
        comparisonValue: 5,
      });
      expect(bigIntModel.hasErrors()).toBeUndefined();

      // number and BigInt comparison (should work)
      const numberModel = new GteTestModel({
        testValue: 10,
        comparisonValue: BigInt(5),
      });
      expect(numberModel.hasErrors()).toBeUndefined();
    });
  });
});
