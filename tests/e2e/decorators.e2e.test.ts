/**
 * @description E2E tests for decorator-validation decorators
 * Tests all property and class decorators against src/lib/dist builds
 */
import {
  getLibrary,
  TEST_ROOT,
  // Decorators must be imported statically for TypeScript transpilation
  model,
  required,
  min,
  max,
  step,
  minlength,
  maxlength,
  pattern,
  email,
  url,
  password,
  date,
  type,
  list,
  option,
  eq,
  diff,
  gt,
  gte,
  lt,
  lte,
} from "./e2e.config";
import type {
  Model as ModelType,
  ModelArg,
  ModelErrorDefinition as ModelErrorDefinitionType,
} from "./e2e.config";

describe(`E2E Decorators Tests [${TEST_ROOT}]`, () => {
  let lib: Awaited<ReturnType<typeof getLibrary>>;
  let Model: typeof ModelType;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let ModelErrorDefinition: typeof ModelErrorDefinitionType;
  let ValidationKeys: (typeof lib)["ValidationKeys"];

  beforeAll(async () => {
    lib = await getLibrary();
    Model = lib.Model;
    ModelErrorDefinition = lib.ModelErrorDefinition;
    ValidationKeys = lib.ValidationKeys;
  });

  describe("Basic Validation Decorators", () => {
    it("should validate @required decorator", () => {
      @model()
      class RequiredModel extends Model {
        @required()
        name!: string;

        constructor(arg?: ModelArg<RequiredModel>) {
          super(arg);
        }
      }

      const emptyModel = new RequiredModel();
      const errors = emptyModel.hasErrors();
      expect(errors).toBeDefined();
      expect(errors?.["name"]).toBeDefined();
      expect(errors?.["name"][ValidationKeys.REQUIRED]).toBe(
        "This field is required"
      );

      const validModel = new RequiredModel({ name: "John" });
      expect(validModel.hasErrors()).toBeUndefined();
    });

    it("should validate @min and @max decorators", () => {
      @model()
      class MinMaxModel extends Model {
        @min(10)
        @max(100)
        value!: number;

        constructor(arg?: ModelArg<MinMaxModel>) {
          super(arg);
        }
      }

      const tooLow = new MinMaxModel({ value: 5 });
      let errors = tooLow.hasErrors();
      expect(errors?.["value"][ValidationKeys.MIN]).toBe(
        "The minimum value is 10"
      );

      const tooHigh = new MinMaxModel({ value: 150 });
      errors = tooHigh.hasErrors();
      expect(errors?.["value"][ValidationKeys.MAX]).toBe(
        "The maximum value is 100"
      );

      const valid = new MinMaxModel({ value: 50 });
      expect(valid.hasErrors()).toBeUndefined();
    });

    it("should validate @step decorator", () => {
      @model()
      class StepModel extends Model {
        @step(5)
        value!: number;

        constructor(arg?: ModelArg<StepModel>) {
          super(arg);
        }
      }

      const invalid = new StepModel({ value: 7 });
      const errors = invalid.hasErrors();
      expect(errors?.["value"][ValidationKeys.STEP]).toBe(
        "Invalid value. Not a step of 5"
      );

      const valid = new StepModel({ value: 15 });
      expect(valid.hasErrors()).toBeUndefined();
    });

    it("should validate @minlength and @maxlength decorators", () => {
      @model()
      class LengthModel extends Model {
        @minlength(3)
        @maxlength(10)
        text!: string;

        constructor(arg?: ModelArg<LengthModel>) {
          super(arg);
        }
      }

      const tooShort = new LengthModel({ text: "ab" });
      let errors = tooShort.hasErrors();
      expect(errors?.["text"][ValidationKeys.MIN_LENGTH]).toBe(
        "The minimum length is 3"
      );

      const tooLong = new LengthModel({ text: "abcdefghijk" });
      errors = tooLong.hasErrors();
      expect(errors?.["text"][ValidationKeys.MAX_LENGTH]).toBe(
        "The maximum length is 10"
      );

      const valid = new LengthModel({ text: "hello" });
      expect(valid.hasErrors()).toBeUndefined();
    });

    it("should validate @pattern decorator", () => {
      @model()
      class PatternModel extends Model {
        @pattern(/^[A-Z][a-z]+$/)
        name!: string;

        constructor(arg?: ModelArg<PatternModel>) {
          super(arg);
        }
      }

      const invalid = new PatternModel({ name: "john" });
      const errors = invalid.hasErrors();
      expect(errors?.["name"][ValidationKeys.PATTERN]).toBe(
        "The value does not match the pattern"
      );

      const valid = new PatternModel({ name: "John" });
      expect(valid.hasErrors()).toBeUndefined();
    });
  });

  describe("Format Validation Decorators", () => {
    it("should validate @email decorator", () => {
      @model()
      class EmailModel extends Model {
        @email()
        emailAddress!: string;

        constructor(arg?: ModelArg<EmailModel>) {
          super(arg);
        }
      }

      const invalid = new EmailModel({ emailAddress: "not-an-email" });
      const errors = invalid.hasErrors();
      expect(errors?.["emailAddress"][ValidationKeys.EMAIL]).toBe(
        "The value is not a valid email"
      );

      const valid = new EmailModel({ emailAddress: "test@example.com" });
      expect(valid.hasErrors()).toBeUndefined();
    });

    it("should validate @url decorator", () => {
      @model()
      class UrlModel extends Model {
        @url()
        website!: string;

        constructor(arg?: ModelArg<UrlModel>) {
          super(arg);
        }
      }

      const invalid = new UrlModel({ website: "not-a-url" });
      const errors = invalid.hasErrors();
      expect(errors?.["website"][ValidationKeys.URL]).toBe(
        "The value is not a valid URL"
      );

      const valid = new UrlModel({ website: "https://example.com" });
      expect(valid.hasErrors()).toBeUndefined();
    });

    it("should validate @password decorator", () => {
      @model()
      class PasswordModel extends Model {
        @password()
        pwd!: string;

        constructor(arg?: ModelArg<PasswordModel>) {
          super(arg);
        }
      }

      const weak = new PasswordModel({ pwd: "simple" });
      const errors = weak.hasErrors();
      expect(errors?.["pwd"][ValidationKeys.PASSWORD]).toBeDefined();

      const strong = new PasswordModel({ pwd: "Str0ng_P@ssword!" });
      expect(strong.hasErrors()).toBeUndefined();
    });

    it("should validate @date decorator", () => {
      @model()
      class DateModel extends Model {
        @date("yyyy-MM-dd")
        @required()
        birthDate!: Date;

        constructor(arg?: ModelArg<DateModel>) {
          super(arg);
        }
      }

      const valid = new DateModel({ birthDate: new Date("2000-01-15") });
      expect(valid.hasErrors()).toBeUndefined();
      expect(valid.birthDate).toBeInstanceOf(Date);
    });
  });

  describe("Type and Collection Decorators", () => {
    it("should validate @type decorator", () => {
      @model()
      class TypeModel extends Model {
        @type([String, Number])
        value!: string | number;

        constructor(arg?: ModelArg<TypeModel>) {
          super(arg);
        }
      }

      const validString = new TypeModel({ value: "hello" });
      expect(validString.hasErrors()).toBeUndefined();

      const validNumber = new TypeModel({ value: 42 });
      expect(validNumber.hasErrors()).toBeUndefined();
    });

    it("should validate @list decorator with primitive types", () => {
      @model()
      class ListModel extends Model {
        @list(String)
        @minlength(1)
        @maxlength(5)
        @required()
        items!: string[];

        constructor(arg?: ModelArg<ListModel>) {
          super(arg);
        }
      }

      const empty = new ListModel({ items: [] });
      let errors = empty.hasErrors();
      expect(errors?.["items"][ValidationKeys.MIN_LENGTH]).toBeDefined();

      const tooMany = new ListModel({
        items: ["a", "b", "c", "d", "e", "f"],
      });
      errors = tooMany.hasErrors();
      expect(errors?.["items"][ValidationKeys.MAX_LENGTH]).toBeDefined();

      const valid = new ListModel({ items: ["a", "b", "c"] });
      expect(valid.hasErrors()).toBeUndefined();
    });

    it("should validate @list decorator with Model types", () => {
      @model()
      class InnerModel extends Model {
        @required()
        name!: string;

        constructor(arg?: ModelArg<InnerModel>) {
          super(arg);
        }
      }

      @model()
      class OuterModel extends Model {
        @list(InnerModel)
        @required()
        children!: InnerModel[];

        constructor(arg?: ModelArg<OuterModel>) {
          super(arg);
        }
      }

      const valid = new OuterModel({
        children: [{ name: "Child 1" }, { name: "Child 2" }],
      });
      expect(valid.hasErrors()).toBeUndefined();
      expect(valid.children[0]).toBeInstanceOf(InnerModel);
    });

    it("should validate @option decorator with array", () => {
      @model()
      class OptionArrayModel extends Model {
        @option(["red", "green", "blue"])
        color!: string;

        constructor(arg?: ModelArg<OptionArrayModel>) {
          super(arg);
        }
      }

      const invalid = new OptionArrayModel({ color: "yellow" });
      const errors = invalid.hasErrors();
      expect(errors?.["color"][ValidationKeys.ENUM]).toBeDefined();

      const valid = new OptionArrayModel({ color: "red" });
      expect(valid.hasErrors()).toBeUndefined();
    });

    it("should validate @option decorator with enum", () => {
      enum Status {
        PENDING = "pending",
        ACTIVE = "active",
        COMPLETED = "completed",
      }

      @model()
      class OptionEnumModel extends Model {
        @option(Status)
        status!: Status;

        constructor(arg?: ModelArg<OptionEnumModel>) {
          super(arg);
        }
      }

      const invalid = new OptionEnumModel({ status: "unknown" as any });
      const errors = invalid.hasErrors();
      expect(errors?.["status"][ValidationKeys.ENUM]).toBeDefined();

      const valid = new OptionEnumModel({ status: Status.ACTIVE });
      expect(valid.hasErrors()).toBeUndefined();
    });
  });

  describe("Comparison Decorators", () => {
    it("should validate @eq decorator", () => {
      @model()
      class EqModel extends Model {
        @required()
        password!: string;

        @eq("password")
        @required()
        confirmPassword!: string;

        constructor(arg?: ModelArg<EqModel>) {
          super(arg);
        }
      }

      const mismatch = new EqModel({
        password: "secret123",
        confirmPassword: "different",
      });
      const errors = mismatch.hasErrors();
      expect(errors?.["confirmPassword"][ValidationKeys.EQUALS]).toBeDefined();

      const match = new EqModel({
        password: "secret123",
        confirmPassword: "secret123",
      });
      expect(match.hasErrors()).toBeUndefined();
    });

    it("should validate @diff decorator", () => {
      @model()
      class DiffModel extends Model {
        @required()
        oldPassword!: string;

        @diff("oldPassword")
        @required()
        newPassword!: string;

        constructor(arg?: ModelArg<DiffModel>) {
          super(arg);
        }
      }

      const same = new DiffModel({
        oldPassword: "secret123",
        newPassword: "secret123",
      });
      const errors = same.hasErrors();
      expect(errors?.["newPassword"][ValidationKeys.DIFF]).toBeDefined();

      const different = new DiffModel({
        oldPassword: "secret123",
        newPassword: "newSecret456",
      });
      expect(different.hasErrors()).toBeUndefined();
    });

    it("should validate @gt and @gte decorators", () => {
      @model()
      class GtModel extends Model {
        @required()
        min!: number;

        @gt("min")
        value!: number;

        constructor(arg?: ModelArg<GtModel>) {
          super(arg);
        }
      }

      const invalid = new GtModel({ min: 10, value: 10 });
      const errors = invalid.hasErrors();
      expect(errors?.["value"][ValidationKeys.GREATER_THAN]).toBeDefined();

      const valid = new GtModel({ min: 10, value: 15 });
      expect(valid.hasErrors()).toBeUndefined();

      @model()
      class GteModel extends Model {
        @required()
        min!: number;

        @gte("min")
        value!: number;

        constructor(arg?: ModelArg<GteModel>) {
          super(arg);
        }
      }

      const validEqual = new GteModel({ min: 10, value: 10 });
      expect(validEqual.hasErrors()).toBeUndefined();
    });

    it("should validate @lt and @lte decorators", () => {
      @model()
      class LtModel extends Model {
        @required()
        max!: number;

        @lt("max")
        value!: number;

        constructor(arg?: ModelArg<LtModel>) {
          super(arg);
        }
      }

      const invalid = new LtModel({ max: 10, value: 10 });
      const errors = invalid.hasErrors();
      expect(errors?.["value"][ValidationKeys.LESS_THAN]).toBeDefined();

      const valid = new LtModel({ max: 10, value: 5 });
      expect(valid.hasErrors()).toBeUndefined();

      @model()
      class LteModel extends Model {
        @required()
        max!: number;

        @lte("max")
        value!: number;

        constructor(arg?: ModelArg<LteModel>) {
          super(arg);
        }
      }

      const validEqual = new LteModel({ max: 10, value: 10 });
      expect(validEqual.hasErrors()).toBeUndefined();
    });
  });

  describe("Combined Decorators", () => {
    it("should validate multiple decorators on same property", () => {
      @model()
      class CombinedModel extends Model {
        @required()
        @minlength(5)
        @maxlength(20)
        @pattern(/^[a-zA-Z]+$/)
        username!: string;

        constructor(arg?: ModelArg<CombinedModel>) {
          super(arg);
        }
      }

      const empty = new CombinedModel();
      let errors = empty.hasErrors();
      expect(errors?.["username"][ValidationKeys.REQUIRED]).toBeDefined();

      const tooShort = new CombinedModel({ username: "abc" });
      errors = tooShort.hasErrors();
      expect(errors?.["username"][ValidationKeys.MIN_LENGTH]).toBeDefined();

      const invalidPattern = new CombinedModel({ username: "user123" });
      errors = invalidPattern.hasErrors();
      expect(errors?.["username"][ValidationKeys.PATTERN]).toBeDefined();

      const valid = new CombinedModel({ username: "JohnDoe" });
      expect(valid.hasErrors()).toBeUndefined();
    });

    it("should validate complex nested model with all decorator types", () => {
      @model()
      class Address extends Model {
        @required()
        @minlength(5)
        street!: string;

        @required()
        city!: string;

        @pattern(/^\d{5}(-\d{4})?$/)
        zipCode?: string;

        constructor(arg?: ModelArg<Address>) {
          super(arg);
        }
      }

      @model()
      class Person extends Model {
        @required()
        @minlength(2)
        @maxlength(50)
        name!: string;

        @required()
        @min(0)
        @max(150)
        age!: number;

        @email()
        email?: string;

        @required()
        @type(Address)
        address!: Address;

        constructor(arg?: ModelArg<Person>) {
          super(arg);
        }
      }

      const valid = new Person({
        name: "John Doe",
        age: 30,
        email: "john@example.com",
        address: {
          street: "123 Main Street",
          city: "Springfield",
          zipCode: "12345",
        },
      });

      expect(valid.hasErrors()).toBeUndefined();
      expect(valid.address).toBeInstanceOf(Address);
    });
  });
});
