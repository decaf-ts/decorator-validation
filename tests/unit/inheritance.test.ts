import { required, Model, model } from "../../src";
import type { ModelArg } from "../../src";
import { hashObj } from "../../src";
import { Decoration, Metadata, propMetadata } from "@decaf-ts/decoration";

type Callback = (...args: any) => void;

class Test1 extends Model {
  @required()
  prop!: string;

  constructor(obj?: ModelArg<Test1>) {
    super();
    Model.fromObject(this, obj);
  }
}

class Test2 extends Test1 {
  @required()
  prop2?: string = undefined;

  constructor(obj?: ModelArg<Test2>) {
    super(obj);
    Model.fromObject(this, obj);
  }
}

@model()
class Test3 extends Test2 {
  constructor(obj?: ModelArg<Test3>) {
    super(obj);
  }
}

class Test4 extends Test2 {
  constructor(obj?: ModelArg<Test4>) {
    super(obj);
  }
}

describe("inheritance Test", () => {
  it("maintains inheritance prototypal structure", () => {
    const tm3 = new Test3();
    const tm4 = new Test4();

    function getInheritanceStructure(model: any, accum?: string[]): string[] {
      const prot = Object.getPrototypeOf(model);
      accum = accum || [];
      accum.push(prot.constructor.name);
      if (prot === Object.prototype) return accum;
      return getInheritanceStructure(prot, accum);
    }

    const is3 = getInheritanceStructure(tm3);
    const is4 = getInheritanceStructure(tm4);

    expect(is4).toEqual(
      expect.arrayContaining(["Test4", "Test2", "Test1", "Model"])
    );
    expect(is3).toEqual(
      expect.arrayContaining(["Test3", "Test2", "Test1", "Model"])
    );
  });

  it.skip("maintains constructor names", () => {
    class OperationsRegistry {
      private cache: { [indexer: string]: any } = {};

      /**
       *
       * @param {string | {}} target
       * @param {string} propKey
       * @param {string} operation
       * @param {OperationHandler[]} [accum] used internally for caching previous
       * @return {OperationHandler[] | undefined}
       */
      get<OperationHandler>(
        target: string | Record<string, any>,
        propKey: string,
        operation: string,
        accum?: OperationHandler[]
      ): OperationHandler[] | undefined {
        accum = accum || [];
        let name;
        try {
          name = typeof target === "string" ? target : target.constructor.name;
          accum.push(
            ...Object.values(
              (this.cache[name][propKey][operation] as OperationHandler[]) || []
            )
          );
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          if (
            typeof target === "string" ||
            Object.getPrototypeOf(target) === Object.prototype
          )
            return accum;
        }

        let proto = Object.getPrototypeOf(target);
        if (proto.constructor.name === name)
          proto = Object.getPrototypeOf(proto);

        return this.get(proto, propKey, operation, accum);
      }

      /**
       *
       * @param {OperationHandler} handler
       * @param {string} operation
       * @param {{}} target
       * @param {string | symbol} propKey
       * @param {}
       */
      register<OperationHandler>(
        handler: OperationHandler,
        operation: string,
        target: { [indexer: string]: any },
        propKey: string | symbol
      ): void {
        const name = target.constructor.name;
        const handlerName = hashObj(handler as Record<string, any>).toString();

        if (!this.cache[name]) this.cache[name] = {};
        if (!this.cache[name][propKey]) this.cache[name][propKey] = {};
        if (!this.cache[name][propKey][operation])
          this.cache[name][propKey][operation] = {};
        if (this.cache[name][propKey][operation][handlerName]) return;
        this.cache[name][propKey][operation][handlerName] = handler;
      }
    }

    const registry = new OperationsRegistry();

    class Decorators {
      static on =
        (
          operation: string[],
          handler: any,
          args: any[] = [],
          ...props: string[]
        ) =>
        (target: any, propertyKey?: any) => {
          const name = target.constructor.name;
          operation.forEach((op) => {
            op = "on." + op;
            let metadata;
            metadata = Reflect.getMetadata(op, target, propertyKey);
            // metadata = Metadata.readOperation(
            //   target.constructor,
            //   propertyKey as string,
            //   op
            // );
            if (!metadata)
              metadata = {
                operation: op,
                handlers: {},
              };

            const handlerKey = hashObj(
              handler as Record<string, any>
            ).toString();

            if (
              !metadata.handlers[name] ||
              !metadata.handlers[name][propertyKey] ||
              !(handlerKey in metadata.handlers[name][propertyKey])
            ) {
              metadata.handlers[name] = metadata.handlers[name] || {};
              metadata.handlers[name][propertyKey] =
                metadata.handlers[name][propertyKey] || {};
              metadata.handlers[name][propertyKey][handlerKey] = {
                args: args,
                props: props,
              };

              Reflect.defineMetadata(op, metadata, target, propertyKey);
              // Metadata.saveOperation(
              //   target.constructor,
              //   propertyKey as string,
              //   op,
              //   metadata
              // );
            }

            registry.register(handler, op, target, propertyKey);
          });
        };
    }

    const decoratorMock: any = jest.spyOn(Decorators, "on");

    class Handler {
      static handler1 = function (key: string, model: any, callback: Callback) {
        model["updatedOn"] = "handler1";
        callback(undefined, model);
      };

      static handler2 = function (key: string, model: any, callback: Callback) {
        model["updatedOn"] = "handler2";
        callback(undefined, model);
      };
    }

    const mock: any = jest.spyOn(Handler, "handler1");
    Object.defineProperty(mock, "name", { value: "mock" }); // making sure the function names are different since the hash will be the same

    const otherMock: any = jest.spyOn(Handler, "handler2");
    Object.defineProperty(otherMock, "name", { value: "otherMock" }); // making sure the function names are different since the hash will be the same

    class BaseModel extends Model {
      @Decorators.on(["create"], Handler.handler1)
      updatedOn?: string;

      constructor(baseModel?: ModelArg<BaseModel>) {
        super(baseModel);
        // Model.fromObject<BaseModel>(this, baseModel);
      }
    }

    class OverriddenBaseModel extends BaseModel {
      @Decorators.on(["create"], Handler.handler2)
      override updatedOn?: string = undefined;

      constructor(overriddenBaseModel?: ModelArg<OverriddenBaseModel>) {
        super(overriddenBaseModel);
        // Model.fromObject<OverriddenBaseModel>(this, overriddenBaseModel);
      }
    }

    @model()
    class OtherBaseModel extends OverriddenBaseModel {
      constructor(otherBaseModel?: ModelArg<OtherBaseModel>) {
        super(otherBaseModel);
      }
    }

    expect(decoratorMock).toHaveBeenCalledTimes(2);

    const overRidden = new OverriddenBaseModel();
    expect(overRidden).toBeDefined();

    const decorators = Reflection.getPropertyDecorators(
      "on.create",
      overRidden,
      "updatedOn",
      true
    );

    // const metaRead = Metadata.readOperation(
    //   overRidden.constructor as any,
    //   "updatedOn" as string,
    //   "on.create"
    // );

    expect(decorators).toBeDefined();
    expect(decorators?.decorators).toBeDefined();
    expect(decorators?.decorators.length).toEqual(1);
    const handlers = registry.get(
      overRidden,
      "updatedOn",
      "on.create"
    ) as any[];
    expect(handlers).toBeDefined();
    expect(handlers?.length).toEqual(2);

    handlers.reverse().forEach((h) => {
      h("", overRidden, (err: any, model: OverriddenBaseModel) =>
        console.log(err, model)
      );
    });

    expect(overRidden?.updatedOn).toBeDefined();
    expect(overRidden?.updatedOn).toEqual("handler2");

    const other = new OtherBaseModel();

    expect(other).toBeDefined();

    const otherDecorators = Reflection.getPropertyDecorators(
      "on.create",
      other,
      "updatedOn",
      true
    );

    expect(otherDecorators).toBeDefined();
    expect(otherDecorators?.decorators).toBeDefined();
    expect(otherDecorators?.decorators.length).toEqual(1);
    const otherHandlers = registry.get(
      other,
      "updatedOn",
      "on.create"
    ) as any[];
    expect(otherHandlers).toBeDefined();
    expect(otherHandlers?.length).toEqual(2);

    otherHandlers.reverse().forEach((h) => {
      h("", other, (err: any, model: OtherBaseModel) =>
        console.log(err, model)
      );
    });

    expect(other?.updatedOn).toBeDefined();
    expect(other?.updatedOn).toEqual("handler2");
  });

  it("validates with one level of inheritance", () => {
    const t = new Test2({
      prop2: "something",
    });

    expect(t.hasErrors()).toBeDefined();

    const t2 = new Test2({
      prop: "something",
    });

    expect(t2.hasErrors()).toBeDefined();

    const t3 = new Test2({
      prop: "something",
      prop2: "something",
    });

    expect(t3.hasErrors()).toBeUndefined();
  });

  it("validates with two levels of inheritance", () => {
    const t = new Test3({
      prop2: "something",
    });

    expect(t.hasErrors()).toBeDefined();

    const t2 = new Test3({
      prop: "something",
    });

    expect(t2.hasErrors()).toBeDefined();

    const t3 = new Test3({
      prop: "something",
      prop2: "something",
    });

    expect(t3.hasErrors()).toBeUndefined();
  });
});

describe("per-model metadata scoping", () => {
  const TRANSIENT_KEY = "transient";

  function transient() {
    return Decoration.for(TRANSIENT_KEY)
      .define(function transient(model: any, attribute: any) {
        propMetadata(Metadata.key(TRANSIENT_KEY, attribute), {})(
          model,
          attribute
        );
      })
      .apply();
  }

  @model()
  abstract class ScopedBaseModel extends Model {
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    version?: number;
    constructor(arg?: any) {
      super(arg);
    }
  }

  @model()
  class Jurisdiction extends ScopedBaseModel {
    @required()
    code!: string;

    @required()
    name!: string;

    description?: string;
  }

  @model()
  class Provider extends ScopedBaseModel {
    @required()
    entityPrefix!: string;

    @required()
    entityName!: string;

    description?: string;

    @transient()
    secretSetting?: string;
  }

  const validationKeysOf = (cls: any): string[] => {
    const bucket = Metadata.get(cls, "validation") as any;
    return bucket ? Object.keys(bucket).sort() : [];
  };

  // mirrors the persistence-layer Model.segregate split over the same
  // per-model metadata reads: validatableProperties + the transient bucket
  const segregate = (instance: any) => {
    const ctor = instance.constructor;
    if (!Metadata.get(ctor, TRANSIENT_KEY)) return { model: instance };
    const decorated: string[] = (Metadata as any)[
      "validatableProperties"
    ](ctor);
    const transientProps = Metadata.get(ctor, TRANSIENT_KEY) ?? {};
    const result: any = { model: {}, transient: {} };
    for (const key of decorated) {
      if (Object.keys(transientProps).includes(key))
        result.transient[key] = instance[key];
      else result.model[key] = instance[key];
    }
    result.model = Model.build(result.model, ctor.name);
    return result;
  };

  it("keeps validation buckets disjoint per decorated model", () => {
    const jurKeys = validationKeysOf(Jurisdiction);
    const provKeys = validationKeysOf(Provider);

    expect(jurKeys).toEqual(["code", "name"]);
    expect(provKeys).toEqual(["entityName", "entityPrefix"]);
    expect(jurKeys).not.toContain("entityPrefix");
    expect(jurKeys).not.toContain("entityName");
    expect(jurKeys).not.toContain("secretSetting");
    expect(provKeys).not.toContain("code");
    expect(provKeys).not.toContain("name");
  });

  it("validates each model against its own required properties only", () => {
    const jurEmpty: any = new Jurisdiction({});
    const jurErrors = jurEmpty.hasErrors();
    expect(jurErrors).toBeDefined();
    expect(Object.keys(jurErrors).sort()).toEqual(["code", "name"]);

    const jurFilled: any = new Jurisdiction({ code: "PT", name: "Portugal" });
    expect(jurFilled.hasErrors()).toBeUndefined();

    const provEmpty: any = new Provider({});
    const provErrors = provEmpty.hasErrors();
    expect(provErrors).toBeDefined();
    expect(Object.keys(provErrors).sort()).toEqual([
      "entityName",
      "entityPrefix",
    ]);

    const provFilled: any = new Provider({
      entityPrefix: "PRT",
      entityName: "Portugal Provider",
      secretSetting: "s3cr3t",
    });
    expect(provFilled.hasErrors()).toBeUndefined();
  });

  it("resolves the instance constructor's own validatable properties", () => {
    const jurFilled: any = new Jurisdiction({ code: "PT", name: "Portugal" });

    expect(jurFilled.constructor.name).toBe("Jurisdiction");

    const vp: string[] = (Metadata as any)["validatableProperties"](
      jurFilled.constructor,
      "id"
    );
    expect(vp).toContain("code");
    expect(vp).toContain("name");
    expect(vp).not.toContain("id");
    expect(vp).not.toContain("entityPrefix");
    expect(vp).not.toContain("entityName");
  });

  it("segregates a non-empty per-model record with the transient split", () => {
    const jurFilled: any = new Jurisdiction({ code: "PT", name: "Portugal" });
    const jurSplit: any = segregate(jurFilled);

    expect(Object.keys(jurSplit.model).sort()).toEqual(["code", "name"]);
    expect(jurSplit.model).toBeInstanceOf(Jurisdiction);
    expect(jurSplit.transient).toBeUndefined();

    const provFilled: any = new Provider({
      entityPrefix: "PRT",
      entityName: "Portugal Provider",
      secretSetting: "s3cr3t",
    });
    const provSplit: any = segregate(provFilled);

    expect(provSplit.model).toBeInstanceOf(Provider);
    expect(Object.keys(provSplit.model)).toEqual(
      expect.arrayContaining(["entityPrefix", "entityName"])
    );
    expect(provSplit.model.secretSetting).toBeUndefined();
    expect(provSplit.transient.secretSetting).toBe("s3cr3t");
  });
});
