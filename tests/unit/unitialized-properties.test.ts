import { Model, ModelArg, prop } from "../../src";

describe("unitialized properties", () => {
  class XRequestModelBase extends Model {
    @prop()
    public baseName!: string;

    constructor(arg?: ModelArg<XRequestModelBase>) {
      super(arg);
    }
  }

  class XRequestModel extends XRequestModelBase {
    @prop()
    public userName!: string;
    @prop()
    public name!: string;

    constructor(arg?: ModelArg<XRequestModel>) {
      super(arg);
    }
  }

  it("retrieves all properties uninitialized properties", () => {
    const keys = Model.getAttributes(XRequestModel);
    expect(keys).toBeDefined();
    expect(keys.length).toEqual(3);
  });
});
