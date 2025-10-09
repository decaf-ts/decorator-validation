import { Decoration, Model, type ModelArg, propMetadata } from "../../src";
import { apply } from "@decaf-ts/reflection";

export const Reporter = {
  f1: jest.fn(),
  f2: jest.fn(),
  f3: jest.fn(),
  f4: jest.fn(),
  f5: jest.fn(),
};

function report(name: string, data: any) {
  function report(object: any, attr: any, descriptor: any) {
    Reporter[name]();
    return propMetadata(name, data)(object, attr, descriptor);
  }
  Object.defineProperty(report, "name", {
    value: name,
  });
  return report;
}

function f1() {
  return Decoration.for("f1").define(report("f1", {})).apply();
}

function f2() {
  return Decoration.for("f2").define(report("f2", {})).apply();
}

function f3() {
  return Decoration.for("f3").define(report("f3", {})).apply();
}
/* eslint-disable @typescript-eslint/no-unused-vars */

function f4() {
  return Decoration.for("f4").define(apply(f1(), f2())).apply();
}

function f5() {
  return Decoration.for("f5").define(apply(f3(), f4())).apply();
}

const flavour = "flavour1";
Decoration.flavouredAs(flavour).for("f4").define(f1()).apply();

@f4()
class ConstructionDecoration1 extends Model {
  constructor(arg?: ModelArg<ConstructionDecoration1>) {
    super(arg);
  }
}

describe("dynamic class decoration - no override", () => {
  it("overrides decoration on the constructor", () => {
    expect(Reporter.f1).toHaveBeenCalledTimes(1);
    expect(Reporter.f2).toHaveBeenCalledTimes(1);
    expect(Reporter.f3).toHaveBeenCalledTimes(0);
    expect(Reporter.f4).toHaveBeenCalledTimes(0);
  });
});
