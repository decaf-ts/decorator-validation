import {
  constructFromObject,
  date,
  max,
  min,
  Model,
  ValidationKeys,
  model,
  bindDateToString,
  parseDate,
  formatDate,
  twoDigitPad,
  ModelArg,
  prop,
} from "../../src";

@model()
class TestModel extends Model {
  @date("dd/MM/yyyy")
  @max("2022/01/01")
  @min(new Date("2020/01/01"))
  dateProp?: Date;

  constructor(model?: ModelArg<TestModel>) {
    super();
    constructFromObject<TestModel>(this, model);
  }
}

class TestModel2 extends Model {
  @date("dd/MM/yyyy HH:mm:ss:S")
  dateProp?: Date;

  constructor(model?: ModelArg<TestModel2>) {
    super();
    Model.fromObject(this, model);
  }
}

const format = "dd-MM-yyyy";

@model()
class TestModelInner extends Model {
  @date("dd-MM-yyyy")
  dateProp?: Date;

  constructor(model?: ModelArg<TestModelInner>) {
    super(model);
    Model.fromModel(this, model);
  }
}

@model()
class NestedTestModel extends Model {
  @prop()
  test!: TestModelInner;

  constructor(model?: ModelArg<NestedTestModel>) {
    super();
    Model.fromModel(this, model);
  }
}

describe("Date Integration", function () {
  describe("Date utils", () => {
    it("Binds date to string format", () => {
      const date = new Date();
      const boundDate = bindDateToString(date, format);
      const output = formatDate(date, format);
      expect(boundDate?.toISOString()).toEqual(output);
      expect(boundDate?.toString()).toEqual(output);
    });

    describe("Date Parsing to Format", () => {
      it("Parses undefined", () => {
        let parsedDate: Date | undefined;
        try {
          parsedDate = parseDate(format, undefined);
          expect(parsedDate).toBeUndefined();
        } catch (e: any) {
          expect(e).toBeUndefined();
        }
      });

      it("parses dates", () => {
        const date = new Date();
        let parsedDate: Date | undefined;
        try {
          parsedDate = parseDate(format, date);
          expect(parsedDate).toBeDefined();

          const output = formatDate(date, format);
          expect(parsedDate?.toISOString()).toEqual(output);
          expect(parsedDate?.toString()).toEqual(output);
          expect(parsedDate?.getTime()).toBeLessThan(date.getTime());
        } catch (e: any) {
          expect(e).toBeUndefined();
        }
      });

      it("parses strings", () => {
        const date = new Date();
        const output = formatDate(date, format);

        let parsedDate: Date | undefined;
        try {
          parsedDate = parseDate(format, output);
          expect(parsedDate).toBeDefined();
          expect(parsedDate?.toISOString()).toEqual(output);
          expect(parsedDate?.toString()).toEqual(output);
          expect(parsedDate?.getTime()).toBeLessThan(date.getTime());
        } catch (e: any) {
          expect(e).toBeUndefined();
        }
      });

      it("parses numbers", () => {
        const date = new Date();
        let parsedDate: Date | undefined;
        try {
          parsedDate = parseDate(format, date.getTime());
          expect(parsedDate).toBeDefined();

          const output = formatDate(date, format);
          expect(parsedDate?.toISOString()).toEqual(output);
          expect(parsedDate?.toString()).toEqual(output);
          expect(parsedDate?.getTime()).toBeLessThan(date.getTime());
        } catch (e: any) {
          expect(e).toBeUndefined();
        }
      });
    });
  });

  it("Properly overrides the value", function () {
    const date = new Date();
    const dm = new TestModelInner({
      dateProp: date,
    });

    dm.dateProp = date;

    expect(dm.dateProp).toBeDefined();
    expect(dm.dateProp?.toString()).toEqual(formatDate(date, "dd-MM-yyyy"));
    expect(dm.dateProp?.toISOString()).toEqual(formatDate(date, "dd-MM-yyyy"));
    expect(dm.dateProp?.getTime()).toBeLessThan(date.getTime());
  });

  it("properly overrides the serialization", () => {
    const date = new Date();
    const dm = new TestModel({
      dateProp: date,
    });

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const expected = `${twoDigitPad(day)}/${twoDigitPad(month)}/${year}`;
    expect(dm.dateProp?.toISOString()).toEqual(expected);
    expect(JSON.stringify(dm)).toEqual(`{"dateProp":"${expected}"}`);
  });

  it("deserializes properly", () => {
    const date = new Date();
    const dm = new TestModelInner({
      dateProp: date,
    });

    expect(dm.dateProp?.getTime()).toBeLessThan(date.getTime());

    const dm2 = JSON.parse(JSON.stringify(dm));
    expect(dm.dateProp?.toString()).toEqual(dm2.dateProp);

    let d;

    try {
      d = parseDate(format, dm2.dateProp) as Date;
      expect(d.getTime()).toEqual(dm.dateProp?.getTime());
      const dm3 = new TestModelInner(dm2);
      expect(dm3.dateProp).toEqual(dm.dateProp);
    } catch (e: any) {
      expect(e).toBeUndefined();
    }
  });

  it("handles min decorators validation properly", () => {
    const dm2 = new TestModel({
      dateProp: new Date(1998, 0, 1),
    });
    const errors = dm2.hasErrors();
    expect(errors).toBeDefined();
    if (!errors) return;
    const propErrors = errors.dateProp;
    expect(Object.keys(propErrors).length).toEqual(1);
    expect(Object.keys(propErrors)[0]).toEqual(ValidationKeys.MIN);
  });

  it("handles max decorators validation properly", () => {
    const dm2 = new TestModel({
      dateProp: new Date(2045, 0, 1),
    });
    const errors = dm2.hasErrors();
    expect(errors).toBeDefined();
    if (!errors) return;
    const propErrors = errors.dateProp;
    expect(Object.keys(propErrors).length).toEqual(1);
    expect(Object.keys(propErrors)[0]).toEqual(ValidationKeys.MAX);
  });

  it("Properly recognizes type verification from decorators and overrides the design:type default type checking", function () {
    const dm3 = new TestModel({
      dateProp: "new Date()",
    });

    const errors = dm3.hasErrors();
    expect(errors).toBeDefined();
    if (!errors) return;

    expect(Object.keys(errors).length).toEqual(1);
    const keys = Object.keys(errors[Object.keys(errors)[0]]);
    expect(keys.length).toEqual(1);
    expect(keys[0]).toEqual(ValidationKeys.DATE);
    expect(Object.values(errors[Object.keys(errors)[0]])[0]).toEqual(
      "Invalid value. not a valid Date"
    );
  });

  it("handles confusing formats", () => {
    const dm2 = new TestModel2({
      dateProp: new Date(2021, 11, 8, 12, 36, 54, 45),
    });
    const errors = dm2.hasErrors();
    expect(errors).toBeUndefined();

    const obj = JSON.parse(JSON.stringify(dm2));
    const md3 = new TestModel2(obj);

    expect(md3).toEqual(dm2);
  });

  it("handles inheritance", () => {
    const dm2 = new NestedTestModel({
      test: {
        dateProp: new Date(2021, 11, 8, 12, 36, 54, 45),
      },
    });
    const errors = dm2.hasErrors();
    expect(errors).toBeUndefined();

    const obj = JSON.parse(JSON.stringify(dm2));
    const md3 = new NestedTestModel(obj);

    expect(md3).toEqual(dm2);
    expect(md3.test?.dateProp).toBeInstanceOf(Date);
    expect(dm2.test?.dateProp).toBeInstanceOf(Date);
    expect(dm2.test?.dateProp?.getTime()).toEqual(
      md3.test?.dateProp?.getTime()
    );
  });
});
