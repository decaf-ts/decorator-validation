import { Metadata } from "@decaf-ts/decoration";
import { Model, ModelBuilder, ValidationKeys } from "../../src";

interface DynamicUserModel extends Model {
  name: string;
  age: number;
}

describe("ModelBuilder", () => {
  it("builds a decorated class dynamically", () => {
    const builder = ModelBuilder.builder();

    builder.setName("DynamicUser");
    const nameAttr = builder.string("name");
    nameAttr.required();
    nameAttr.minlength(2);

    const ageAttr = builder.number("age");
    ageAttr.required();
    ageAttr.min(10);

    const DynamicUser = builder.build();

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

    builder.setName("DynamicMetaModel");
    const attr = builder.string("label");
    attr.required();

    const DynamicMeta = builder.build();

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

    builder.setName("TypedUser");
    const nameAttr = builder.string("name");
    nameAttr.required();
    nameAttr.minlength(2);

    const ageAttr = builder.number("age");
    ageAttr.required();
    ageAttr.min(0);

    const TypedUser = builder.build();

    const typedInstance = new TypedUser({ name: "Bob", age: 21 });
    expect(typedInstance).toBeInstanceOf(TypedUser);
    expect(typedInstance).toBeInstanceOf(Model);
    expect(typedInstance.name).toBe("Bob");

    const typedName: string = typedInstance.name;
    expect(typedName.length).toBeGreaterThan(0);
  });

  it("supports helper decorators and reuses attribute builders", () => {
    const builder = ModelBuilder.builder();
    builder.setName("HelperDecorated");

    const attr = builder.string("title");
    attr.required();
    attr.minlength(3);

    builder.number("count").min(1);

    const HelperClass = builder.build();
    const instance = new HelperClass({ title: "ab", count: 0 });
    const errors = instance.hasErrors();
    expect(errors?.title?.[ValidationKeys.MIN_LENGTH]).toBeDefined();
    expect(errors?.count?.[ValidationKeys.MIN]).toBeDefined();
  });

  it("builds list properties with primitives and nested builders", () => {
    const builder = ModelBuilder.builder();
    builder.setName("DynamicCollection");

    builder.listOf("names").ofPrimitives(String);
    builder
      .listOf("children")
      .ofModel()
      .setName("DynamicChild")
      .string("nickname")
      .required();

    const CollectionClass = builder.build();
    const instance = new CollectionClass({
      names: ["a", "b"],
      children: [{ nickname: "Kid" }, { nickname: "Other" }],
    });

    expect(Array.isArray(instance.names)).toBe(true);
    expect(instance.children[0]).toBeInstanceOf(Model);

    instance.children[1].nickname = "";
    const errors = instance.hasErrors();
    expect(errors?.children).toBeDefined();
  });
});
