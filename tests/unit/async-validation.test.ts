import "reflect-metadata";
import {
  async,
  ASYNC_META_KEY,
  date,
  list,
  model,
  Model,
  ModelArg,
  ModelErrorDefinition,
  required,
  validate,
  Validation,
  VALIDATION_PARENT_KEY,
  ValidationKeys,
} from "../../src";
import {
  CUSTOM_VALIDATION_ERROR_MESSAGE,
  isPromise,
  OrderItemModel,
  OrderModel,
  ShippingModel,
  timeout,
  TimeoutValidator,
} from "./validation.utils";
import { prop } from "@decaf-ts/decoration";

describe("Async Validation", () => {
  beforeAll(() => {
    Validation.register(new TimeoutValidator() as any);
  });

  describe("Promise Validation", () => {
    it("should return a Promise for async validation", async () => {
      const instance = new OrderModel({
        orderProcessingDelay: 500,
        mainItem: new OrderItemModel({
          processingTime: 50,
          tags: ["tag"],
          shippingInfo: new ShippingModel({ carrier: "UPS", estimatedDays: 2 }),
          tracking: [],
        }),
        additionalItems: [],
      });

      const validationResult = validate(instance, true);
      expect(isPromise(validationResult)).toBeTruthy();

      const resolve = await validationResult;
      expect(resolve).toBeDefined();
      expect(resolve).toBeInstanceOf(ModelErrorDefinition);
      expect(Object.keys(resolve).length).toBeGreaterThan(0);
    });

    it("should ignore async decorators when async validation is disabled", () => {
      const instance = new OrderModel({
        orderProcessingDelay: 500,
        mainItem: new OrderItemModel({
          processingTime: 50,
          tags: ["tag"],
          shippingInfo: new ShippingModel({ carrier: "UPS" }),
          tracking: [],
        }),
        additionalItems: [
          new OrderItemModel({
            processingTime: 100,
            shippingInfo: new ShippingModel({
              carrier: "UPS",
              estimatedDays: 2,
            }),
            tracking: [],
          }),
          new OrderItemModel({
            processingTime: 10,
            tags: ["String", 2, 3],
            shippingInfo: new ShippingModel({}),
            tracking: [],
          }),
        ],
      });

      const validationResult = validate(instance, false);
      expect(isPromise(validationResult)).toBeFalsy();
      expect(validationResult).toBeDefined();
      expect(validationResult).toBeInstanceOf(ModelErrorDefinition);
      expect(validationResult).toEqual(
        new ModelErrorDefinition({
          "mainItem.tags": {
            [ValidationKeys.MIN_LENGTH]: "The minimum length is 2",
          },
          "mainItem.shippingInfo.estimatedDays": {
            [ValidationKeys.REQUIRED]: "This field is required",
          },
          additionalItems: {
            [ValidationKeys.LIST]: [
              undefined,
              new ModelErrorDefinition({
                processingTime: {
                  [ValidationKeys.MIN]: "The minimum value is 50",
                },
                tags: {
                  [ValidationKeys.LIST]: "Invalid list of String",
                },
                "shippingInfo.carrier": {
                  [ValidationKeys.REQUIRED]: "This field is required",
                },
                "shippingInfo.estimatedDays": {
                  [ValidationKeys.REQUIRED]: "This field is required",
                },
              }),
            ],
          },
        })
      );
    });

    it("should return a Promise for nested models", async () => {
      const instance = new OrderModel({
        orderProcessingDelay: 50,
        mainItem: new OrderItemModel({
          processingTime: 200, // fail
          tags: ["valid", "valid"],
          shippingInfo: new ShippingModel({
            carrier: "UPS",
            estimatedDays: 3,
          }),
          tracking: [],
        }),
        additionalItems: [
          new OrderItemModel({
            processingTime: 50,
            tags: ["valid", "valid"],
            shippingInfo: new ShippingModel({
              carrier: "UPS",
              estimatedDays: 3,
            }),
            tracking: [],
          }),
        ],
      });

      const validationResult = instance.hasErrors();
      expect(isPromise(validationResult)).toBeTruthy();

      const result = await validationResult;
      expect(result).toBeDefined();
      expect(result).toEqual(
        new ModelErrorDefinition({
          "mainItem.processingTime": { timeout: "Timeout reached" },
        })
      );
    });

    it("should return a Promise for valid nested models in a list", async () => {
      const instance = new OrderModel({
        orderProcessingDelay: 50,
        mainItem: new OrderItemModel({
          processingTime: 50,
          tags: ["valid", "valid"],
          shippingInfo: new ShippingModel({
            carrier: "UPS",
            estimatedDays: 3,
          }),
          tracking: [],
        }),
        additionalItems: [
          new OrderItemModel({
            processingTime: 50,
            tags: ["valid", "valid"],
            shippingInfo: new ShippingModel({
              carrier: "UPS",
              estimatedDays: 3,
            }),
            tracking: [],
          }),
          new OrderItemModel({
            processingTime: 50,
            tags: ["valid", "valid"],
            shippingInfo: new ShippingModel({
              carrier: "UPS",
              estimatedDays: 3,
            }),
            tracking: [],
          }),
        ],
      });

      const validationResult = instance.hasErrors();
      expect(isPromise(validationResult)).toBeTruthy();

      const result = await validationResult;
      expect(result).toBeUndefined();
    });

    it("should return a Promise for async model.hasErrors validation", async () => {
      const instance = new OrderModel({
        orderProcessingDelay: 500,
        mainItem: new OrderItemModel({
          processingTime: 50,
          tags: ["tag"],
          shippingInfo: new ShippingModel({ carrier: "UPS", estimatedDays: 2 }),
          tracking: [],
        }),
        additionalItems: [],
      });

      const validationResult = instance.hasErrors();
      expect(isPromise(validationResult)).toBeTruthy();

      const result = await validationResult;
      expect(result).toBeDefined();
      expect(Object.keys(result).length > 0).toBeTruthy();
      expect(result instanceof ModelErrorDefinition).toBeTruthy();
    });
  });

  it("should pass validation", async () => {
    const instance = new OrderModel({
      orderProcessingDelay: 50,
      mainItem: new OrderItemModel({
        processingTime: 50,
        tags: ["started", "in progress", "completed"],
        shippingInfo: new ShippingModel({ carrier: "UPS", estimatedDays: 2 }),
        tracking: [
          new ShippingModel({ carrier: "UPS", estimatedDays: 2 }),
          new ShippingModel({ carrier: "XPS", estimatedDays: 3 }),
        ],
      }),
      additionalItems: [
        new OrderItemModel({
          processingTime: 50,
          tags: ["in progress", "completed"],
          shippingInfo: new ShippingModel({
            carrier: "UPS",
            estimatedDays: 2,
          }),
          tracking: [
            new ShippingModel({ carrier: "UPS", estimatedDays: 4 }),
            new ShippingModel({ carrier: "XPS", estimatedDays: 1 }),
          ],
        }),
      ],
    });

    const validationResult = await instance.hasErrors();
    expect(validationResult).toBeUndefined();
  });

  it("should fail multiple async validations with timeout error", async () => {
    const instance = new OrderModel({
      orderProcessingDelay: 150, // Fail
      mainItem: new OrderItemModel({
        processingTime: 200, // Fail
        tags: ["pending", "ok"],
        shippingInfo: new ShippingModel({ carrier: "UPS", estimatedDays: 2 }),
        tracking: [],
      }),
      additionalItems: [
        new OrderItemModel({
          processingTime: 250, // Fail
          tags: ["available", "ok"],
          shippingInfo: new ShippingModel({
            carrier: "UPS",
            estimatedDays: 2,
          }),
          tracking: [],
        }),
        new OrderItemModel({
          processingTime: 100,
          tags: ["ok", "check"],
          shippingInfo: new ShippingModel({
            carrier: "UPS",
            estimatedDays: 2,
          }),
          tracking: [],
        }),
        new OrderItemModel({
          processingTime: 500, // Fail
          tags: ["in progress", "completed"],
          shippingInfo: new ShippingModel({
            carrier: "UPS",
            estimatedDays: 2,
          }),
          tracking: [],
        }),
      ],
    });

    const validationResult = await instance.hasErrors();
    expect(validationResult).toEqual(
      new ModelErrorDefinition({
        orderProcessingDelay: { timeout: "Custom validation error" },
        "mainItem.processingTime": { timeout: "Timeout reached" },
        additionalItems: {
          list: [
            new ModelErrorDefinition({
              processingTime: { timeout: "Timeout reached" },
            }),
            undefined,
            new ModelErrorDefinition({
              processingTime: { timeout: "Timeout reached" },
            }),
          ],
        },
      })
    );
  });

  it("should fail validation with custom message", async () => {
    const instance = new OrderModel({
      orderProcessingDelay: 150,
      mainItem: new OrderItemModel({
        processingTime: 200,
        tags: ["ok"],
        shippingInfo: new ShippingModel({ carrier: "UPS", estimatedDays: 2 }),
        tracking: [],
      }),
      additionalItems: [],
    });

    const validationResult = await instance.hasErrors();
    expect(validationResult).toMatchObject(
      new ModelErrorDefinition({
        orderProcessingDelay: { timeout: "Custom validation error" },
        "mainItem.processingTime": { timeout: "Timeout reached" },
        additionalItems: {
          [ValidationKeys.MIN_LENGTH]: "The minimum length is 1",
        },
      })
    );
  });

  it("should fail when shippingInfo is missing", async () => {
    const instance = new OrderModel({
      orderProcessingDelay: 50,
      mainItem: new OrderItemModel({
        processingTime: 50,
        tags: ["ok"],
        shippingInfo: undefined as any,
        tracking: [],
      }),
      additionalItems: [
        new OrderItemModel({
          processingTime: 50,
          tags: ["ok"],
          shippingInfo: new ShippingModel({
            carrier: "UPS",
            estimatedDays: 2,
          }),
          tracking: [],
        }),
      ],
    });

    const validationResult = await instance.hasErrors();
    expect(validationResult).toMatchObject(
      new ModelErrorDefinition({
        "mainItem.shippingInfo": {
          [ValidationKeys.REQUIRED]: "This field is required",
        },
      })
    );
  });

  describe("Mixed Sync/Async Validation", () => {
    @async()
    @model()
    class InnerItemModel extends Model {
      @required()
      name!: string;

      @timeout()
      delay!: number;

      constructor(model?: ModelArg<InnerItemModel>) {
        super(model);
        Model.fromObject<InnerItemModel>(this, model);
      }
    }

    @model()
    class SyncParentModel extends Model {
      @required()
      title!: string;

      @list(InnerItemModel)
      items!: InnerItemModel[];

      constructor(model?: ModelArg<SyncParentModel>) {
        super(model);
        Model.fromObject<SyncParentModel>(this, model);
      }
    }

    @async()
    @model()
    class AsyncRootModel extends Model<true> {
      @timeout(CUSTOM_VALIDATION_ERROR_MESSAGE)
      rootDelay!: number;

      @required()
      syncParent!: SyncParentModel;

      constructor(model?: ModelArg<AsyncRootModel>) {
        super(model);
        Model.fromObject<AsyncRootModel>(this, model);
      }
    }

    it("should pass validation with valid nested models", async () => {
      const instance = new AsyncRootModel({
        rootDelay: 50,
        syncParent: new SyncParentModel({
          title: "Valid Title",
          items: [
            new InnerItemModel({ name: "Item 1", delay: 50 }),
            new InnerItemModel({ name: "Item 2", delay: 50 }),
          ],
        }),
      });

      const result = await instance.hasErrors();
      expect(result).toBeUndefined();
    });

    it("should fail validation with multiple async errors", async () => {
      const instance = new AsyncRootModel({
        rootDelay: 200, // fail
        syncParent: new SyncParentModel({
          title: "Invalid Title",
          items: [
            new InnerItemModel({ name: "Item 1", delay: 300 }), // fail
            new InnerItemModel({ name: "Item 2", delay: 10 }), // OK
          ],
        }),
      });

      const result = await validate(instance, true);
      expect(result).toEqual(
        new ModelErrorDefinition({
          rootDelay: { timeout: "Custom validation error" },
          "syncParent.items": {
            list: [
              new ModelErrorDefinition({
                delay: { timeout: "Timeout reached" },
              }),
              undefined,
            ],
          },
        })
      );
    });

    it("should not execute async validators on syncModel.hasErrors()", () => {
      const instance = new AsyncRootModel({
        rootDelay: 500, // async fail
        syncParent: new SyncParentModel({
          title: "", // sync fail
          items: [
            new InnerItemModel({ name: "Item 1", delay: 300 }), // async fail
          ],
        }),
      });

      const result = instance.hasErrors();
      expect(result).toEqual(
        new ModelErrorDefinition({
          "syncParent.title": {
            [ValidationKeys.REQUIRED]: "This field is required",
          },
        })
      );
    });

    it("should execute async validators when using validate(..., true) on sync model", async () => {
      const instance = new AsyncRootModel({
        rootDelay: 500, // fail async
        syncParent: new SyncParentModel({
          title: "", // fail sync
          items: [
            new InnerItemModel({ name: "Ok", delay: 50 }),
            new InnerItemModel({ name: "Ok", delay: 600 }), // fail async
          ],
        }),
      });

      const result = await validate(instance, true);
      expect(result).toEqual(
        new ModelErrorDefinition({
          rootDelay: { timeout: "Custom validation error" },
          "syncParent.title": { required: "This field is required" },
          "syncParent.items": {
            list: [
              undefined,
              new ModelErrorDefinition({
                delay: { timeout: "Timeout reached" },
              }),
            ],
          },
        })
      );
    });
  });

  describe("Symbol Property Validation", () => {
    @model()
    class ModelInner extends Model {
      @date("dd-MM-yyyy")
      @required()
      dateProp?: Date;

      constructor(model?: ModelArg<ModelInner>) {
        super(model);
      }
    }

    @model()
    class SyncTestModel extends Model {
      @prop()
      publicValue!: string;

      @prop()
      inner!: ModelInner;

      constructor(model?: ModelArg<SyncTestModel>) {
        super(model);
      }
    }

    @async()
    @model()
    class AsyncTestModel extends Model<true> {
      @timeout()
      asyncValue!: number;

      @prop()
      inner!: ModelInner;

      constructor(model?: ModelArg<AsyncTestModel>) {
        super(model);
      }
    }

    // Internal symbols that should never appear in object keys
    const INTERNAL_SYMBOLS = [VALIDATION_PARENT_KEY, ASYNC_META_KEY];

    // Test case generator for both sync and async models
    function createTestCases() {
      return [
        {
          description: "Sync Model",
          modelFactory: () => {
            return new SyncTestModel({
              publicValue: "test",
              inner: new ModelInner(),
            });
          },
        },
        {
          description: "Async Model",
          modelFactory: () => {
            return new AsyncTestModel({
              asyncValue: 100,
              inner: new ModelInner(),
            });
          },
        },
      ];
    }

    // Main test that validates symbol exclusion
    it.each(createTestCases())(
      "should exclude internal symbols from $description instances",
      async ({ modelFactory }) => {
        const instance = modelFactory() as any;

        const hasErrorsSpy = jest.spyOn(instance, "hasErrors");
        const nestedHasErrorsSpy = jest.spyOn(instance.inner, "hasErrors");

        // Trigger validation to ensure that symbol keys were added/excluded
        await Promise.resolve(instance.hasErrors());

        // Validate instance
        INTERNAL_SYMBOLS.forEach((sym) => {
          expect(instance[sym]).toBeUndefined();
          expect(Object.hasOwnProperty.call(instance, sym)).toBeFalsy();
        });

        // Validate nested instance
        const nestedInstance = instance.inner;
        INTERNAL_SYMBOLS.forEach((sym) => {
          expect(nestedInstance[sym]).toBeUndefined();
          expect(Object.hasOwnProperty.call(nestedInstance, sym)).toBeFalsy();
        });

        expect(hasErrorsSpy).toHaveBeenCalled();
        expect(nestedHasErrorsSpy).toHaveBeenCalled();
      }
    );

    // Additional test for plain objects
    it("should handle internal symbols in plain objects", () => {
      const plainObj = {
        publicProp: "visible",
        [VALIDATION_PARENT_KEY]: "hidden",
        [ASYNC_META_KEY]: "hidden",
      };

      // Symbols should exist but not be enumerable
      INTERNAL_SYMBOLS.forEach((sym) => {
        expect(plainObj[sym]).toBeDefined();
      });

      // Only public properties should appear in keys
      expect(Object.keys(plainObj)).toEqual(["publicProp"]);
    });

    it("should handle internal symbols in plain objects", () => {
      const plainObj = {
        publicProp: "visible",
        [VALIDATION_PARENT_KEY]: "hidden",
        [ASYNC_META_KEY]: "hidden",
      };

      // Symbols should exist but not be enumerable
      INTERNAL_SYMBOLS.forEach((sym) => {
        expect(plainObj[sym]).toBeDefined();
      });

      // Only public properties should appear in keys
      expect(Object.keys(plainObj)).toEqual(["publicProp"]);
    });

    it("should not contain any Symbol properties except INTERNAL_SYMBOLS", () => {
      // Create test instances
      const syncModel = new SyncTestModel({
        publicValue: "test",
        inner: new ModelInner({ nestedValue: "nested" }),
      });

      const asyncModel = new AsyncTestModel({
        asyncValue: 100,
        inner: new ModelInner({ nestedValue: "nested" }),
      });

      [syncModel, asyncModel].forEach((instance) => {
        const hasErrorsSpy = jest.spyOn(instance, "hasErrors");
        const nestedHasErrorsSpy = jest.spyOn(instance.inner, "hasErrors");
        instance.hasErrors();

        const instanceSymbols = Object.getOwnPropertySymbols(instance).filter(
          (sym) => !INTERNAL_SYMBOLS.includes(sym)
        );
        expect(instanceSymbols).toEqual([]);
        expect(hasErrorsSpy).toHaveBeenCalled();

        const nestedSymbols = Object.getOwnPropertySymbols(
          instance.inner
        ).filter((sym) => !INTERNAL_SYMBOLS.includes(sym));
        expect(nestedSymbols).toEqual([]);
        expect(nestedHasErrorsSpy).toHaveBeenCalled();
      });
    });
  });
});
