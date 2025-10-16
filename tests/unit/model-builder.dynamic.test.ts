import "reflect-metadata";

import {
  minlength,
  min,
  Model,
  ModelBuilder,
  ModelKeys,
  Validation,
  ValidationKeys,
  model,
  required,
} from "../../src";

@model()
class DecoratorBootstrap extends Model {
  @required()
  @minlength(1)
  bootstrap!: string;

  @min(0)
  baseline!: number;
}

describe("Dynamic ModelBuilder", () => {
  it("builds a unique, registered model with applied validators", () => {
    const baseName = "RuntimeUser";

    const UserModel = ModelBuilder.builder
      .setName(baseName)
      .string("name")
      .required()
      .minlength(3)
      .number("age")
      .min(18)
      .build();

    const instance = new UserModel({ name: "Jo", age: 17 });
    expect(instance).toBeInstanceOf(Model);
    expect(instance).toBeInstanceOf(UserModel);
    expect(instance.hasErrors()).toBeDefined();

    const success = new UserModel({ name: "John", age: 21 });
    expect(success.hasErrors()).toBeUndefined();

    const minLengthKey = ValidationKeys.MIN_LENGTH;
    const typeMeta = Reflect.getMetadata(
      ModelKeys.TYPE,
      UserModel.prototype,
      "name"
    );

    expect(typeMeta).toBe(String);
    expect(UserModel.name.startsWith(`${baseName}_`)).toBeTruthy();

    const errors = instance.hasErrors();
    expect(errors?.name).toBeDefined();
    expect(Object.keys(errors!.name!)).toEqual(
      expect.arrayContaining([minLengthKey])
    );
    expect(Object.keys(errors!.age!)).toEqual(
      expect.arrayContaining([ValidationKeys.MIN])
    );

    const registered = Model.get(UserModel.name);
    expect(registered).toBe(UserModel);
  });

  it("supports removing decorators dynamically", () => {
    const key = Validation.key(ValidationKeys.REQUIRED);

    const OptionalModel = ModelBuilder.builder
      .setName("OptionalModel")
      .string("nickname")
      .required()
      .undecorate("required")
      .build();

    const instance = new OptionalModel({});
    const errors = instance.hasErrors();

    expect(errors?.nickname?.[key]).toBeUndefined();
  });

  it("allows manual decorator usage for backward compatibility", () => {
    const CustomModel = ModelBuilder.builder
      .setName("ManualDecorated")
      .number("score")
      .decorate(required(), min(10))
      .build();

    const bad = new CustomModel({ score: 5 });
    expect(bad.hasErrors()).toBeDefined();

    const good = new CustomModel({ score: 120 });
    expect(good.hasErrors()).toBeUndefined();
  });

  it("maintains unique constructor names for repeated builds", () => {
    const First = ModelBuilder.builder
      .setName("DuplicateName")
      .string("label")
      .build();

    const Second = ModelBuilder.builder
      .setName("DuplicateName")
      .string("label")
      .build();

    expect(First.name).not.toEqual(Second.name);
    expect(First.name.startsWith("DuplicateName_")).toBeTruthy();
    expect(Second.name.startsWith("DuplicateName_")).toBeTruthy();
  });
});
