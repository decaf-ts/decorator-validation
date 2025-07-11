import { z } from "zod/index";
import { hashedBy, Model, ModelArg, serializedBy } from "../../model";
import { Tool, ToolParameters } from "fastmcp";

export const createModelParameters = z
  .array(
    z.object({
      name: z.string(),
      type: z.enum(["string", "number", "boolean", "Date"]),
      decorators: z.array(
        z.object({
          name: z.string(),
          args: z.array(z.any()).optional(),
        })
      ),
    })
  )
  .describe("Model properties with their decorators");

type T = z.infer<typeof createModelParameters> & ToolParameters;

export const createModelTool: Tool<undefined, T> = {
  name: "create-model",
  description: "Create a new model class with validation decorators",
  parameters: createModelParameters,
  execute: async (args: T) => {
    const { name, properties, options } = args;

    // Create dynamic model class
    const dynamicModel = class extends Model {
      constructor(data?: ModelArg<typeof dynamicModel>) {
        super(data);
        Model.fromModel(this, data);
      }
    };

    // Apply model-level decorators
    if (options?.hashAlgorithm) {
      hashedBy(options.hashAlgorithm)(dynamicModel);
    }
    if (options?.serializer) {
      serializedBy(options.serializer)(dynamicModel);
    }

    // Apply property decorators
    properties.forEach((prop) => {
      prop.decorators.forEach((decorator) => {
        const decoratorFn = getDecoratorFunction(decorator.name);
        if (decoratorFn) {
          decoratorFn(...(decorator.args || []))(
            dynamicModel.prototype,
            prop.name
          );
        }
      });
    });

    // Register the model
    Object.defineProperty(dynamicModel, "name", { value: name });
    Model.register(dynamicModel);
    modelRegistry.set(name, dynamicModel);

    return `Model "${name}" created and registered successfully`;
  },
};
