import { Decoration, Model, type ModelArg, propMetadata } from "../../src";
import { apply } from "@decaf-ts/reflection";

export const Reporter = {
  f1: jest.fn(),
  f2: jest.fn(),
  f3: jest.fn(),
  f4: jest.fn(),
  f5: jest.fn(),
};
let count = 0;
function report(name: string, data: any) {
  function report(object: any, attr: any, descriptor: any) {
    Reporter[name]();
    count = count + 1;
    console.log(count);
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

function f4() {
  return Decoration.for("f4").define(apply(f1(), f2())).apply();
}

function f5() {
  return Decoration.for("f5").define(apply(f3(), f4())).apply();
}

const flavour = "flavour3";
Decoration.setFlavourResolver(() => {
  return flavour;
});
Decoration.flavouredAs(flavour).for("f4").extend(f3()).apply();

@f4()
class ConstructionDecoration3 extends Model {
  constructor(arg?: ModelArg<ConstructionDecoration3>) {
    super(arg);
  }
}

describe("dynamic class decoration - extension", () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it("extends decoration on the constructor", () => {
    expect(Reporter.f1).toHaveBeenCalledTimes(1);
    expect(Reporter.f2).toHaveBeenCalledTimes(1);
    expect(Reporter.f3).toHaveBeenCalledTimes(1);
    expect(Reporter.f4).toHaveBeenCalledTimes(0);
  });
});
