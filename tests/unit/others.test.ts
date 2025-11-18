import { date, maxlength, model, Model, ModelArg } from "../../src/index";
import { Metadata } from "@decaf-ts/decoration";

describe("weird  cases", () => {
  it("stores types as  strings?!?", () => {
    @model()
    class TestModel extends Model {
      @maxlength(10)
      name!: string;

      @date()
      then!: Date;

      constructor(arg?: ModelArg<TestModel>) {
        super(arg);
      }
    }

    const meta = Metadata.get(TestModel);

    const type = Metadata.type(TestModel, "then");
    const validations = Metadata.validationFor<TestModel>(TestModel, "then");
    const allowedTypes = Metadata.allowedTypes(TestModel, "then");
    expect(type).toBe(Date);
    expect(validations).toBeDefined();
    expect(validations?.type).toBeDefined();
    // expect((validations as any).type.customTypes).toEqual([Date]);
    // expect(allowedTypes).toEqual([Date]);
  });
});
