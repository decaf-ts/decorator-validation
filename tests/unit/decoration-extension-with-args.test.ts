import { Decoration, Model, type ModelArg, propMetadata } from "../../src";
import { apply } from "@decaf-ts/reflection";

export const Reporter = {
  f1: jest.fn(),
  f2: jest.fn(),
  f3: jest.fn(),
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
  return Decoration.for("f2")
    .define({ decorator: report, args: ["f2", {}] })
    .apply();
}

function f3(...args: any[]) {
  return (obj: any, attr: any) => {
    Reporter.f3(...args);
    console.log(args);
  };
}

const flavour = "flavour3";
Decoration.setFlavourResolver(() => {
  return flavour;
});
Decoration.flavouredAs(flavour)
  .for("f2")
  .extend({
    decorator: f3,
    transform: (args: any[]) => {
      return ["f1", {}];
    },
  })
  .apply();

describe("dynamic class decoration - extension", () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it("extends decoration on the constructor", () => {
    class ConstructionDecoration5 extends Model {
      @f2()
      arg!: string;

      constructor(arg?: ModelArg<ConstructionDecoration5>) {
        super(arg);
      }
    }

    expect(Reporter.f1).toHaveBeenCalledTimes(0);
    expect(Reporter.f2).toHaveBeenCalledTimes(1);
    expect(Reporter.f3).toHaveBeenCalledTimes(1);
    expect(Reporter.f3).toHaveBeenCalledWith("f1", {});
  });
});
