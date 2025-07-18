import { Decoration, model, Model, type ModelArg } from "../../src";

function f1() {
  return function f1Inner(original: any) {
    return original;
  };
}

function f2() {
  return function f2Inner(original: any) {
    return original;
  };
}

function f3() {
  return Decoration.for("test").define(f1(), f2()).apply();
}

@f2()
@f1()
class DynamicClassDecorationClass1 extends Model {
  constructor(arg?: ModelArg<DynamicClassDecorationClass1>) {
    super(arg);
  }
}

@f3()
class DynamicClassDecorationClass2 extends Model {
  constructor(arg?: ModelArg<DynamicClassDecorationClass2>) {
    super(arg);
  }
}

describe.skip("dynamic class decoration", () => {
  it("Registers the class", () => {
    const m = new DynamicClassDecorationClass1();
    expect(m.constructor.name).toEqual(DynamicClassDecorationClass1.name);
  });
  it("registers the class", () => {
    const m = new DynamicClassDecorationClass2();
    expect(m.constructor.name).toEqual(DynamicClassDecorationClass2.name);
  });
});
