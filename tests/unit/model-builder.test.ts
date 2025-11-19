import { Metadata } from "@decaf-ts/decoration";
import {
  Model,
  ModelBuilder,
  ValidationKeys,
  min,
  minlength,
  required,
} from "../../src";

interface DynamicUserModel extends Model {
  name: string;
  age: number;
}

describe("ModelBuilder", () => {
  it("builds a decorated class dynamically", () => {
    const builder = ModelBuilder.builder();

    const DynamicUser = builder
      .setName("DynamicUser")
      .string("name")
      .decorate(required(), minlength(2))
      .number("age")
      .decorate(required(), min(10))
      .build();

    expect(DynamicUser.name).toEqual("DynamicUser");
    expect(Model.get("DynamicUser")).toBe(DynamicUser);

    const instance = new DynamicUser({ name: "a", age: 5 });
    expect(instance).toBeInstanceOf(Model);
    expect(instance).toBeInstanceOf(DynamicUser);

    const errors = instance.hasErrors();
    expect(errors).toBeDefined();
    expect(errors?.name?.[ValidationKeys.MIN_LENGTH]).toBeDefined();
    expect(errors?.age?.[ValidationKeys.MIN]).toBeDefined();

    instance.name = "ab";
    instance.age = 12;
    expect(instance.hasErrors()).toBeUndefined();
  });

  it("registers property metadata for dynamic models", () => {
    const builder = ModelBuilder.builder();

    const DynamicMeta = builder
      .setName("DynamicMetaModel")
      .string("label")
      .decorate(required())
      .build();

    const attrs = Metadata.properties(DynamicMeta) ?? [];
    expect(attrs).toEqual(expect.arrayContaining(["label"]));

    const typeMetadata = Metadata.type(DynamicMeta, "label" as any);
    expect(typeMetadata?.name).toEqual(String.name);

    const instance = new DynamicMeta({ label: undefined as any });
    const errors = instance.hasErrors();
    expect(errors?.label?.[ValidationKeys.REQUIRED]).toBeDefined();
  });

  it("returns constructors where instances are typed and instanceof the class", () => {
    const builder = ModelBuilder.builder<DynamicUserModel>();

    const TypedUser = builder
      .setName("TypedUser")
      .string("name")
      .decorate(required(), minlength(2))
      .number("age")
      .decorate(required(), min(0))
      .build();

    const typedInstance = new TypedUser({ name: "Bob", age: 21 });
    expect(typedInstance).toBeInstanceOf(TypedUser);
    expect(typedInstance).toBeInstanceOf(Model);
    expect(typedInstance.name).toBe("Bob");

    const typedName: string = typedInstance.name;
    expect(typedName.length).toBeGreaterThan(0);
  });
});
