import {
  list,
  maxlength,
  minlength,
  Model,
  model,
  ModelArg,
  ModelErrorDefinition,
  required,
} from "../../src";

describe("Validation Lists", () => {
  describe("validation sync lists", () => {
    @model()
    class SyncItemModel extends Model {
      @required()
      name!: string;

      constructor(model?: ModelArg<SyncItemModel>) {
        super(model);
      }
    }

    @model()
    class SyncRootModel extends Model {
      @list(SyncItemModel)
      @minlength(1)
      @maxlength(2)
      @required()
      items!: SyncItemModel[];

      @list(Number)
      numbers!: number[];

      constructor(model?: ModelArg<SyncRootModel>) {
        super(model);
      }
    }

    it("should pass with correct data", () => {
      const instance = new SyncRootModel({
        items: [new SyncItemModel({ name: "Item 1" })],
        numbers: [1, 2, 3], // @maxlength not applied here
      });

      const errors = instance.hasErrors();
      expect(errors).toBeUndefined();
    });

    it("should fail with more than 2 items (@maxlength)", () => {
      const instance = new SyncRootModel({
        items: [
          new SyncItemModel({ name: "Item 1" }),
          new SyncItemModel({ name: "Item 2" }),
          new SyncItemModel({ name: "Item 3" }), // Exceeds maxlength
        ],
      });

      const errors = instance.hasErrors();
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors?.items).toBeDefined();
      expect(errors?.toString()).toContain("The maximum length is 2");
    });

    it("should fail if any SyncItemModel has empty name", () => {
      const model = new SyncRootModel({
        items: [new SyncItemModel({ name: "" })], // Invalid name
      });

      const errors = model.hasErrors() || {};
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors).toEqual(
        new ModelErrorDefinition({
          items: {
            // @ts-expect-error dont know why
            list: [
              {
                name: {
                  required: "This field is required",
                },
              },
            ],
          },
        })
      );
    });

    it("should fail when required list is missing", () => {
      const instance = new SyncRootModel({
        numbers: [1, 2, 3],
      });

      const errors = instance.hasErrors() || {};
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors["items"]).toBeDefined();
      expect(errors?.toString()).toContain("This field is required");
    });
  });

  describe("validation edge cases", () => {
    it("should validate Set<number> correctly", () => {
      @model()
      class NumberSetModel extends Model {
        @list(Number)
        numbers!: Set<number>;

        constructor(model?: ModelArg<NumberSetModel>) {
          super(model);
        }
      }

      const instance = new NumberSetModel({
        numbers: new Set([1, 2, 3]),
      });

      const errors = instance.hasErrors();
      expect(errors).toBeUndefined();
    });

    it("should fail with wrong types in Set", () => {
      @model()
      class InvalidSetModel extends Model {
        @list(Number)
        numbers!: Set<string>; // Wrong type

        constructor(model?: ModelArg<InvalidSetModel>) {
          super(model);
        }
      }

      const instance = new InvalidSetModel({
        numbers: new Set(["a", "b"] as any),
      });

      const errors = instance.hasErrors();
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors["numbers"]).toBeDefined();
    });

    it("should handle mixed valid lists correctly", () => {
      @model()
      class ItemModel extends Model {
        @required()
        name!: string;

        constructor(model?: ModelArg<ItemModel>) {
          super(model);
        }
      }

      @model()
      class MixedModel extends Model {
        @list(String)
        strings!: string[];

        @list(Number)
        numbers!: number[];

        @list(ItemModel)
        @minlength(1)
        items!: ItemModel[];

        constructor(model?: ModelArg<MixedModel>) {
          super(model);
        }
      }

      const instance = new MixedModel({
        strings: ["a", "b"],
        numbers: [1, 2, 3],
        items: [new ItemModel({ name: "Valid" })],
      });

      const errors = instance.hasErrors();
      expect(errors).toBeUndefined();
    });

    it("should fail on empty Set with @minlength", () => {
      @model()
      class MinLengthModel extends Model {
        @list(String)
        @minlength(1)
        strings!: Set<string>;

        constructor(model?: ModelArg<MinLengthModel>) {
          super(model);
        }
      }

      const instance = new MinLengthModel({
        strings: new Set(), // Empty set
      });

      const errors = instance.hasErrors() || {};
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors).toBeDefined();
      expect(errors).toEqual(
        new ModelErrorDefinition({
          strings: { minlength: "The minimum length is 1" },
        })
      );
    });

    it("should fail on list exceeding @maxlength", () => {
      @model()
      class MaxLengthModel extends Model {
        @list(Number)
        @maxlength(2)
        numbers!: number[];

        constructor(model?: ModelArg<MaxLengthModel>) {
          super(model);
        }
      }

      const instance = new MaxLengthModel({
        numbers: [1, 2, 3], // Exceeds maxlength
      });

      const errors = instance.hasErrors() || {};
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors["numbers"]).toBeDefined();
      expect(errors?.toString()).toContain("The maximum length is 2");
    });

    it("should handle mixed invalid elements in @list(Model)", () => {
      @model()
      class ItemModel extends Model {
        @required()
        name!: string;

        constructor(model?: ModelArg<ItemModel>) {
          super(model);
        }
      }

      @model()
      class MixedElementsModel extends Model {
        @list(ItemModel)
        items!: (ItemModel | undefined | null | object)[];

        constructor(model?: ModelArg<MixedElementsModel>) {
          super(model);
        }
      }

      const instance = new MixedElementsModel({
        items: [
          new ItemModel({ name: "Valid" }),
          undefined,
          null,
          { not: "a model" },
          new ItemModel({ name: "" }), // Invalid model
        ],
      });

      const errors = instance.hasErrors() || {};
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors).toEqual(
        new ModelErrorDefinition({
          items: {
            // @ts-expect-error dont know why
            list: [
              undefined,
              "Value has no validatable type",
              new ModelErrorDefinition({
                name: {
                  required: "This field is required",
                },
              }),
              new ModelErrorDefinition({
                name: {
                  required: "This field is required",
                },
              }),
              new ModelErrorDefinition({
                name: {
                  required: "This field is required",
                },
              }),
            ],
          },
        })
      );
    });

    it("should handle nested list models", () => {
      @model()
      class NestedItemModel extends Model {
        @required()
        id!: string;

        constructor(model?: ModelArg<NestedItemModel>) {
          super(model);
        }
      }

      @model()
      class ParentModel extends Model {
        @list(NestedItemModel)
        @minlength(1)
        items!: NestedItemModel[];

        constructor(model?: ModelArg<ParentModel>) {
          super(model);
        }
      }

      @model()
      class RootModel extends Model {
        @list(ParentModel)
        parents!: ParentModel[];

        constructor(model?: ModelArg<RootModel>) {
          super(model);
        }
      }

      const validModel = new RootModel({
        parents: [
          new ParentModel({
            items: [new NestedItemModel({ id: "1" })],
          }),
          new ParentModel({
            items: [
              new NestedItemModel({ id: "2" }),
              new NestedItemModel({ id: "3" }),
            ],
          }),
        ],
      });
      expect(validModel.hasErrors()).toBeUndefined();

      const invalidModel = new RootModel({
        parents: [
          new ParentModel({
            items: [new NestedItemModel({ id: "1" })],
          }),
          new ParentModel({
            items: [0, false, {}, new NestedItemModel({ id: "" })], // Invalid item
          }),
        ],
      });

      const errors = invalidModel.hasErrors() || {};
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors).toEqual(
        new ModelErrorDefinition({
          parents: {
            // @ts-expect-error dont know why
            list: [
              undefined,
              new ModelErrorDefinition({
                items: {
                  // @ts-expect-error dont know why
                  list: [
                    undefined, // TODO fix this
                    "Value has no validatable type",
                    new ModelErrorDefinition({
                      id: {
                        required: "This field is required",
                      },
                    }),
                    new ModelErrorDefinition({
                      id: {
                        required: "This field is required",
                      },
                    }),
                  ],
                },
              }),
            ],
          },
        })
      );
    });
  });

  describe("type checking", () => {
    it("should validate List<Number> correctly", () => {
      @model()
      class NumberListModel extends Model {
        @list(Number)
        @required()
        numbers!: number[];

        constructor(model?: ModelArg<NumberListModel>) {
          super(model);
        }
      }

      const validModel = new NumberListModel({ numbers: [1, 2, 3] });
      const invalidModel = new NumberListModel({ numbers: ["a", "b"] as any });

      expect(validModel.hasErrors()).toBeUndefined();

      const errors = invalidModel.hasErrors();
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors).toEqual(
        new ModelErrorDefinition({
          numbers: { list: "Invalid list of Number" },
        })
      );
    });

    it("should validate List<String> correctly", () => {
      @model()
      class StringListModel extends Model {
        @list(String)
        @minlength(1)
        strings!: string[];

        constructor(model?: ModelArg<StringListModel>) {
          super(model);
        }
      }

      const validModel = new StringListModel({ strings: ["a", "b", "c"] });
      const invalidModel = new StringListModel({ strings: [1, 2, 3] as any });

      expect(validModel.hasErrors()).toBeUndefined();

      const errors = invalidModel.hasErrors();
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors).toEqual(
        new ModelErrorDefinition({
          strings: { list: "Invalid list of String" },
        })
      );
    });

    it("should validate List<Boolean> correctly", () => {
      @model()
      class BooleanListModel extends Model {
        @list(Boolean)
        flags!: boolean[];

        constructor(model?: ModelArg<BooleanListModel>) {
          super(model);
        }
      }

      const validModel = new BooleanListModel({ flags: [true, false, true] });
      const invalidModel = new BooleanListModel({ flags: ["true", 0] as any });

      expect(validModel.hasErrors()).toBeUndefined();

      const errors = invalidModel.hasErrors();
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors).toEqual(
        new ModelErrorDefinition({
          flags: { list: "Invalid list of Boolean" },
        })
      );
    });

    it("should validate mixed type lists correctly", () => {
      @model()
      class MixedListModel extends Model {
        @list([String, Number, Boolean])
        mixed!: (string | number | boolean)[];

        constructor(model?: ModelArg<MixedListModel>) {
          super(model);
        }
      }

      const validModel = new MixedListModel({
        mixed: ["text", 42, true, "another", 0, false],
      });

      const invalidModel = new MixedListModel({
        mixed: ["text", { object: true }, null] as any,
      });

      expect(validModel.hasErrors()).toBeUndefined();

      const errors = invalidModel.hasErrors();
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors).toEqual(
        new ModelErrorDefinition({
          mixed: { list: "Invalid list of String,Number,Boolean" },
        })
      );
    });

    it("should validate Set<String> correctly", () => {
      @model()
      class StringSetModel extends Model {
        @list(String)
        @maxlength(3)
        stringSet!: Set<string>;

        constructor(model?: ModelArg<StringSetModel>) {
          super(model);
        }
      }

      const validModel = new StringSetModel({
        stringSet: new Set(["a", "b", "c"]),
      });

      const invalidModel = new StringSetModel({
        stringSet: new Set([1, 2, 3, 4]),
      });

      expect(validModel.hasErrors()).toBeUndefined();

      const errors = invalidModel.hasErrors();
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors).toEqual(
        new ModelErrorDefinition({
          stringSet: {
            list: "Invalid list of String",
            maxlength: "The maximum length is 3",
          },
        })
      );
    });

    it.skip("should validate List<Date> correctly", () => {
      @model()
      class DateListModel extends Model {
        @list(Date)
        dates!: Date[];

        constructor(model?: ModelArg<DateListModel>) {
          super(model);
        }
      }

      const validModel = new DateListModel({
        dates: [new Date(), new Date(2020, 0, 1)],
      });

      const invalidModel = new DateListModel({
        dates: [new Date(), "not-a-date"] as any,
      });

      expect(validModel.hasErrors()).toBeUndefined();

      const errors = invalidModel.hasErrors();
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors).toEqual(
        new ModelErrorDefinition({ dates: { list: "Invalid list of Date" } })
      );
    });

    it.skip("should validate Set<Date> correctly", () => {
      @model()
      class DateSetModel extends Model {
        @list(Date)
        dates!: Set<Date>;

        constructor(model?: ModelArg<DateSetModel>) {
          super(model);
        }
      }

      const validModel = new DateSetModel({
        dates: new Set([new Date(), new Date(2020, 0, 1)]),
      });

      const invalidModel = new DateSetModel({
        dates: new Set([new Date(), "not-a-date"]) as any,
      });

      expect(validModel.hasErrors()).toBeUndefined();

      const errors = invalidModel.hasErrors();
      expect(errors).toBeInstanceOf(ModelErrorDefinition);
      expect(errors).toEqual(
        new ModelErrorDefinition({ dates: { list: "Invalid list of Date" } })
      );
    });
  });
});
