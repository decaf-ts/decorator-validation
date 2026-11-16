import {
  date,
  min,
  minlength,
  model,
  Model,
  required,
  type ModelArg,
} from "../../src";

@model()
class NullableModel extends Model {
  @required()
  name!: string;

  @minlength(3)
  code?: string;

  @date("yyyy-MM-dd")
  when?: Date;

  @min(1)
  count?: number;

  constructor(arg?: ModelArg<NullableModel>) {
    super(arg);
  }
}

/** `null` means "no value": only @required judges it. */
describe("null property values", () => {
  it("are valid for optional properties, whatever their rules or type", () => {
    const m = new NullableModel({ name: "n" });
    (m as any).code = null;
    (m as any).when = null;
    (m as any).count = null;
    expect(m.hasErrors()).toBeUndefined();
  });

  it("still fail @required", () => {
    const m = new NullableModel({ name: "n" });
    (m as any).name = null;
    const errors = m.hasErrors();
    expect(errors).toBeDefined();
    expect(JSON.stringify(errors)).toContain("name");
  });

  it("do not hide invalid values", () => {
    const m = new NullableModel({ name: "n", code: "ab", count: 0 });
    const errors = JSON.stringify(m.hasErrors());
    expect(errors).toContain("code");
    expect(errors).toContain("count");
  });

  it("work the same asynchronously", async () => {
    const m = new NullableModel({ name: "n" });
    (m as any).code = null;
    (m as any).when = null;
    expect(await (m as any).hasErrors(true)).toBeUndefined();
  });
});
