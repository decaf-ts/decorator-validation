import {
  constructFromObject,
  hashedBy,
  Hashing,
  isModel,
  model,
  Model,
  ModelArg,
  required,
} from "../../src";
import { HashingFunction } from "../../src";

@model()
class TestModel extends Model {
  name?: string = undefined;

  constructor(model?: TestModel | Record<any, any>) {
    super(model);
    constructFromObject<TestModel>(this, model);
  }
}

describe("Hashing methods", function () {
  it("hashes a string", function () {
    const testString = "this is test string";
    const h = Hashing.hash(testString);
    expect(h).toBe("607041879");
  });

  it("hashes an object", () => {
    const d = new Date(Date.UTC(2021, 1, 1));
    const dummyObj = { key: 1 };
    const dummyArr = [1, 5];
    const otherDummyArr = [dummyObj, 1, "test", dummyArr];
    const obj = {
      name: "name",
      number: 10,
      date: d,
      arr: otherDummyArr,
    };

    const h = Hashing.hash(obj);

    expect(h).toBe("1915133567");
  });

  it("can use other hashing mechanisms", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const func: HashingFunction = (obj: any) => {
      return "AAAA";
    };

    Hashing.register("AAAA", func, true);

    const d = new Date(Date.UTC(2021, 1, 1));
    const dummyObj = { key: 1 };
    const dummyArr = [1, 5];
    const otherDummyArr = [dummyObj, 1, "test", dummyArr];
    const obj = {
      name: "name",
      number: 10,
      date: d,
      arr: otherDummyArr,
    };

    const h = Hashing.hash(obj);
    expect(typeof h).toBe("string");
    expect(h).toBe("AAAA");
  });

  const hashIt: HashingFunction = (arg: HashModel1 | HashModel2) => {
    return `this is a hash of ${arg.hashMe}`;
  };

  Hashing.register("hash", hashIt);

  @model()
  @hashedBy("hash")
  class HashModel1 extends Model {
    @required()
    hashMe!: string;

    constructor(arg?: ModelArg<HashModel1>) {
      super();
      constructFromObject(this, arg);
    }
  }

  @hashedBy("hash")
  class HashModel2 extends Model {
    @required()
    hashMe!: string;

    constructor(arg?: ModelArg<HashModel2>) {
      super();
      constructFromObject(this, arg);
    }
  }

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("Properly tags the hashing function on model decorated classes", () => {
    const model = new HashModel1({
      hashMe: "hash",
    });
    expect(model.hash()).toEqual("this is a hash of hash");
  });

  it("Properly tags the hashing function non model decorated classes classes", () => {
    const model = new HashModel2({
      hashMe: "hash",
    });
    expect(model.hash()).toEqual("this is a hash of hash");
  });
});

describe("Model Verification", function () {
  it("Fails to Detects a model for normal serialization", function () {
    const tm = new TestModel();
    expect(isModel(tm)).toBe(true);
    expect(isModel(JSON.parse(JSON.stringify(tm)))).toBe(false);
  });

  it("Detects a model when properly serialized", function () {
    const tm = new TestModel();
    expect(isModel(tm)).toBe(true);
    expect(isModel(Model.deserialize(tm.serialize()))).toBe(true);
    expect(isModel({})).toBe(false);
  });
});
