import { Metadata, prop } from "@decaf-ts/decoration";
import {
  list,
  minlength,
  Model,
  model,
  type ModelArg,
  required,
  type,
} from "../../src";

/**
 * `hasErrors` must flag any property whose value does not match its declared (design) type,
 * whether the property carries validation decorators or only `@prop()`. `@type(...)` overrides
 * the accepted types.
 */

@model()
class OnlyProps extends Model {
  @prop()
  name?: string;

  @prop()
  count?: number;

  @prop()
  active?: boolean;

  @prop()
  when?: Date;

  constructor(arg?: ModelArg<OnlyProps>) {
    super(arg);
  }
}

@model()
class Inner extends Model {
  @prop()
  label?: string;

  constructor(arg?: ModelArg<Inner>) {
    super(arg);
  }
}

@model()
class Mixed extends Model {
  @required()
  id!: string;

  @prop()
  name?: string;

  @minlength(2)
  code?: string;

  @prop()
  inner?: Inner;

  constructor(arg?: ModelArg<Mixed>) {
    super(arg);
  }
}

@model()
class Overridden extends Model {
  @type([String, Number])
  value?: string | number;

  @prop()
  @type([String, Number])
  both?: string | number;

  constructor(arg?: ModelArg<Overridden>) {
    super(arg);
  }
}

@model()
class Related extends Model {
  @prop()
  id?: number;

  constructor(arg?: ModelArg<Related>) {
    super(arg);
  }
}

/**
 * Mirrors what `@decaf-ts/core` relation decorators compose: `@oneToOne`/`@manyToOne` apply
 * `prop()` + `type([Model, ...pkTypes])`, `@oneToMany`/`@manyToMany` apply
 * `prop()` + `list([Model, ...pkTypes])`, so a non-populated relation (just the id) is valid.
 */
/** Same, but with lazy `() => Model` references (as `@oneToOne(() => Other)` passes them). */
@model()
class LazyRelationLike extends Model {
  @prop()
  @type([() => Related, Number])
  one?: Related | number;

  @prop()
  @list([() => Related, String])
  many?: (Related | string)[];

  constructor(arg?: ModelArg<LazyRelationLike>) {
    super(arg);
  }
}

@model()
class RelationLike extends Model {
  @prop()
  @type([Related, Number])
  one?: Related | number;

  @type([Related, String])
  @prop()
  owner?: Related | string;

  @prop()
  @list([Related, Number])
  many?: (Related | number)[];

  @prop()
  @list([Related, String])
  tags?: (Related | string)[];

  constructor(arg?: ModelArg<RelationLike>) {
    super(arg);
  }
}

/** Union types are emitted as `Object` design type and are deliberately not type-checked. */
@model()
class UnionDesign extends Model {
  @prop()
  either?: string | number;

  constructor(arg?: ModelArg<UnionDesign>) {
    super(arg);
  }
}

const typeErrorOf = (m: Model, prop: string): string | undefined => {
  const errors: any = m.hasErrors();
  return errors?.[prop]?.type;
};

describe("type validation of @prop() properties", () => {
  it("accepts values matching the declared types", () => {
    const m = new OnlyProps({
      name: "a",
      count: 1,
      active: true,
      when: new Date(),
    });
    expect(m.hasErrors()).toBeUndefined();
  });

  it("does not flag undefined values (no @required)", () => {
    expect(new OnlyProps({}).hasErrors()).toBeUndefined();
  });

  it.each([
    ["name", 123, "String"],
    ["count", "1", "Number"],
    ["active", "yes", "Boolean"],
    ["when", 42, "Date"],
  ])(
    "flags %s = %p on a model with no validation decorators",
    (propName, value, expected) => {
      const m = new OnlyProps({ [propName]: value } as any);
      const error = typeErrorOf(m, propName);
      expect(error).toBeDefined();
      expect(error).toContain(expected);
    }
  );

  it("flags a @prop()-only property on a model that also has validators", () => {
    const m = new Mixed({ id: "1", name: 123 as any });
    expect(typeErrorOf(m, "name")).toContain("String");
    expect((m.hasErrors() as any)?.id).toBeUndefined();
  });

  it("still type-checks properties with validation decorators", () => {
    const m = new Mixed({ id: "1", code: 5 as any });
    expect(typeErrorOf(m, "code")).toBeDefined();
  });

  it("flags a @prop()-only nested model property holding the wrong type", () => {
    const ok = new Mixed({ id: "1", inner: new Inner({ label: "x" }) });
    expect(ok.hasErrors()).toBeUndefined();

    const bad = new Mixed({ id: "1", inner: 5 as any });
    expect((bad.hasErrors() as any)?.inner).toBeDefined();
  });

  describe("@type() overrides", () => {
    it("accepts every overridden type", () => {
      expect(
        new Overridden({ value: "a", both: "b" }).hasErrors()
      ).toBeUndefined();
      expect(new Overridden({ value: 1, both: 2 }).hasErrors()).toBeUndefined();
    });

    it("rejects types outside the override", () => {
      const m = new Overridden({ value: true as any, both: false as any });
      expect(typeErrorOf(m, "value")).toBeDefined();
      expect(typeErrorOf(m, "both")).toBeDefined();
    });
  });

  describe("relation-like overrides (model or its id)", () => {
    it("accepts populated models", () => {
      const m = new RelationLike({
        one: new Related({ id: 1 }),
        owner: new Related({ id: 2 }),
        many: [new Related({ id: 3 })],
        tags: [new Related({ id: 4 })],
      });
      expect(m.hasErrors()).toBeUndefined();
    });

    it("accepts ids of the overridden pk type (non-populated relations)", () => {
      const m = new RelationLike({
        one: 1,
        owner: "o1",
        many: [1, 2],
        tags: ["a", "b"],
      });
      expect(m.hasErrors()).toBeUndefined();
    });

    it("accepts a mix of models and ids in lists", () => {
      const m = new RelationLike({
        many: [new Related({ id: 1 }), 2],
        tags: ["a", new Related({ id: 3 })],
      });
      expect(m.hasErrors()).toBeUndefined();
    });

    it("rejects values that are neither the model nor its id type", () => {
      const errors: any = new RelationLike({
        one: "1" as any,
        owner: 2 as any,
        many: ["x"] as any,
        tags: [true] as any,
      }).hasErrors();
      expect(errors?.one?.type).toBeDefined();
      expect(errors?.owner?.type).toBeDefined();
      expect(errors?.many?.list).toBeDefined();
      expect(errors?.tags?.list).toBeDefined();
    });

    it("validates populated related models", () => {
      const errors: any = new RelationLike({
        one: new Related({ id: "nope" as any }),
      }).hasErrors();
      expect(errors?.["one.id"] ?? errors?.one).toBeDefined();
    });
  });

  describe("lazy () => Model references in @type()", () => {
    it("exposes the RESOLVED accepted types (read back by core relation handlers)", () => {
      const allowed = (Metadata as any).allowedTypes(LazyRelationLike, "one");
      expect(allowed).toEqual([Related, Number]);
      const typeMeta = (Metadata as any).validationFor(
        LazyRelationLike,
        "one",
        "type"
      );
      expect(typeMeta.customTypes).toEqual([Related, Number]);
    });

    it("accepts the model or its id and rejects anything else", () => {
      expect(
        new LazyRelationLike({
          one: new Related({ id: 1 }),
          many: ["a"],
        }).hasErrors()
      ).toBeUndefined();
      expect(new LazyRelationLike({ one: 1 }).hasErrors()).toBeUndefined();
      const errors: any = new LazyRelationLike({ one: "x" as any }).hasErrors();
      expect(errors?.one?.type).toBeDefined();
    });
  });

  it("does not type-check union (Object design type) properties", () => {
    expect(new UnionDesign({ either: "a" }).hasErrors()).toBeUndefined();
    expect(new UnionDesign({ either: 1 }).hasErrors()).toBeUndefined();
  });
});
