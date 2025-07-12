// import { FastMCP } from "fastmcp";
// import { z } from "zod";
// import { version } from "../../package.json";
// import { ModelContextProtocol } from "./ModelContextProtocol";
// import { Model } from "../model";
// import {
//   email,
//   max,
//   maxlength,
//   min,
//   minlength,
//   pattern,
//   required,
// } from "../validation";
// import { createModelTool } from "./tools/createModel.tool";
//
// const DecoratorValidatonMCP = ModelContextProtocol.builder
//   .setName("decaf-validation-server")
//   .setVersion(version)
//   .addTool(createModelTool)
//   .build();
//
// // Initialize FastMCP server
// const server = new FastMCP({
//   name: "decaf-validation-server",
//   // @ts-ignore
//   version: version,
// });
//
// // Model registry for dynamic model management
// const modelRegistry = new Map<string, any>();
//
// // Tool: Validate a model instance
// server.addTool({
//   name: "validate-model",
//   description: "Validate a model instance against its decorators",
//   parameters: z.object({
//     modelName: z.string().describe("Name of the model class"),
//     data: z.record(z.any()).describe("Data to validate"),
//     options: z
//       .object({
//         partial: z.boolean().optional().describe("Allow partial validation"),
//       })
//       .optional(),
//   }),
//   execute: async (args) => {
//     const { modelName, data, options } = args;
//
//     const ModelClass = modelRegistry.get(modelName) || Model.get(modelName);
//     if (!ModelClass) {
//       throw new Error(`Model "${modelName}" not found`);
//     }
//
//     try {
//       const instance = new ModelClass(data);
//       const errors = instance.hasErrors();
//
//       return {
//         isValid: !errors,
//         errors: errors || null,
//         validatedData: errors ? null : instance.serialize(),
//       };
//     } catch (error) {
//       return {
//         isValid: false,
//         errors: [{ message: error.message }],
//         validatedData: null,
//       };
//     }
//   },
// });
//
// // Tool: Get model schema information
// server.addTool({
//   name: "get-model-schema",
//   description: "Get the validation schema for a model",
//   parameters: z.object({
//     modelName: z.string().describe("Name of the model class"),
//   }),
//   execute: async (args) => {
//     const { modelName } = args;
//
//     const ModelClass = modelRegistry.get(modelName) || Model.get(modelName);
//     if (!ModelClass) {
//       throw new Error(`Model "${modelName}" not found`);
//     }
//
//     // Extract validation metadata
//     const instance = new ModelClass();
//     const metadata = Reflect.getMetadata("validation", instance) || {};
//
//     return {
//       modelName,
//       properties: Object.keys(metadata).map((key) => ({
//         name: key,
//         validators: metadata[key] || [],
//       })),
//       capabilities: {
//         serialization: !!instance.serialize,
//         hashing: !!instance.hash,
//         comparison: !!instance.equals,
//       },
//     };
//   },
// });
//
// // Tool: Serialize model
// server.addTool({
//   name: "serialize-model",
//   description: "Serialize a model instance to string",
//   parameters: z.object({
//     modelName: z.string().describe("Name of the model class"),
//     data: z.record(z.any()).describe("Model data to serialize"),
//     format: z.enum(["json", "yaml"]).optional().default("json"),
//   }),
//   execute: async (args) => {
//     const { modelName, data, format } = args;
//
//     const ModelClass = modelRegistry.get(modelName) || Model.get(modelName);
//     if (!ModelClass) {
//       throw new Error(`Model "${modelName}" not found`);
//     }
//
//     const instance = new ModelClass(data);
//     const errors = instance.hasErrors();
//
//     if (errors) {
//       throw new Error(
//         `Cannot serialize invalid model: ${JSON.stringify(errors)}`
//       );
//     }
//
//     return {
//       serialized: instance.serialize(),
//       format,
//       modelName,
//     };
//   },
// });
//
// // Tool: Deserialize model
// server.addTool({
//   name: "deserialize-model",
//   description: "Deserialize a string to model instance",
//   parameters: z.object({
//     serializedData: z.string().describe("Serialized model data"),
//     modelName: z
//       .string()
//       .optional()
//       .describe("Expected model name for validation"),
//   }),
//   execute: async (args) => {
//     const { serializedData, modelName } = args;
//
//     try {
//       const instance = Model.deserialize(serializedData);
//
//       if (modelName && instance.constructor.name !== modelName) {
//         throw new Error(
//           `Expected model "${modelName}", got "${instance.constructor.name}"`
//         );
//       }
//
//       return {
//         modelName: instance.constructor.name,
//         data: JSON.parse(instance.serialize()),
//         isValid: !instance.hasErrors(),
//       };
//     } catch (error) {
//       throw new Error(`Deserialization failed: ${error.message}`);
//     }
//   },
// });
//
// // Tool: Compare models
// server.addTool({
//   name: "compare-models",
//   description: "Compare two model instances for equality",
//   parameters: z.object({
//     modelName: z.string().describe("Name of the model class"),
//     data1: z.record(z.any()).describe("First model data"),
//     data2: z.record(z.any()).describe("Second model data"),
//     excludeFields: z
//       .array(z.string())
//       .optional()
//       .describe("Fields to exclude from comparison"),
//   }),
//   execute: async (args) => {
//     const { modelName, data1, data2, excludeFields } = args;
//
//     const ModelClass = modelRegistry.get(modelName) || Model.get(modelName);
//     if (!ModelClass) {
//       throw new Error(`Model "${modelName}" not found`);
//     }
//
//     const instance1 = new ModelClass(data1);
//     const instance2 = new ModelClass(data2);
//
//     const isEqual = excludeFields
//       ? instance1.equals(instance2, ...excludeFields)
//       : instance1.equals(instance2);
//
//     return {
//       isEqual,
//       hash1: instance1.hash(),
//       hash2: instance2.hash(),
//       differences: isEqual ? null : await findDifferences(instance1, instance2),
//     };
//   },
// });
//
// // Tool: List available decorators
// server.addTool({
//   name: "list-decorators",
//   description: "List all available validation decorators",
//   parameters: z.object({
//     category: z
//       .enum(["basic", "type-specific", "comparison", "all"])
//       .optional()
//       .default("all"),
//   }),
//   execute: async (args) => {
//     const { category } = args;
//
//     const decorators = {
//       basic: [
//         {
//           name: "required",
//           description: "Marks field as required",
//           args: ["message?"],
//         },
//         {
//           name: "min",
//           description: "Minimum value validation",
//           args: ["value", "message?"],
//         },
//         {
//           name: "max",
//           description: "Maximum value validation",
//           args: ["value", "message?"],
//         },
//         {
//           name: "minlength",
//           description: "Minimum length validation",
//           args: ["length", "message?"],
//         },
//         {
//           name: "maxlength",
//           description: "Maximum length validation",
//           args: ["length", "message?"],
//         },
//         {
//           name: "pattern",
//           description: "Regex pattern validation",
//           args: ["pattern", "message?"],
//         },
//         {
//           name: "step",
//           description: "Step value validation",
//           args: ["step", "message?"],
//         },
//       ],
//       "type-specific": [
//         {
//           name: "email",
//           description: "Email format validation",
//           args: ["message?"],
//         },
//         {
//           name: "url",
//           description: "URL format validation",
//           args: ["message?"],
//         },
//         {
//           name: "date",
//           description: "Date format validation",
//           args: ["format?", "message?"],
//         },
//         {
//           name: "password",
//           description: "Password strength validation",
//           args: ["message?"],
//         },
//         {
//           name: "type",
//           description: "Type validation",
//           args: ["type", "message?"],
//         },
//         {
//           name: "list",
//           description: "Array validation",
//           args: ["itemType", "message?"],
//         },
//         {
//           name: "set",
//           description: "Set validation",
//           args: ["itemType", "message?"],
//         },
//       ],
//       comparison: [
//         {
//           name: "eq",
//           description: "Equal to another field",
//           args: ["fieldName", "message?"],
//         },
//         {
//           name: "diff",
//           description: "Different from another field",
//           args: ["fieldName", "message?"],
//         },
//         {
//           name: "lt",
//           description: "Less than another field",
//           args: ["fieldName", "message?"],
//         },
//         {
//           name: "lte",
//           description: "Less than or equal to another field",
//           args: ["fieldName", "message?"],
//         },
//         {
//           name: "gt",
//           description: "Greater than another field",
//           args: ["fieldName", "message?"],
//         },
//         {
//           name: "gte",
//           description: "Greater than or equal to another field",
//           args: ["fieldName", "message?"],
//         },
//       ],
//     };
//
//     if (category === "all") {
//       return {
//         categories: decorators,
//         total: Object.values(decorators).reduce(
//           (sum, arr) => sum + arr.length,
//           0
//         ),
//       };
//     }
//
//     return {
//       category,
//       decorators: decorators[category] || [],
//       count: decorators[category]?.length || 0,
//     };
//   },
// });
//
// // Utility function to get decorator function by name
// function getDecoratorFunction(name: string): Function | null {
//   const decoratorMap = {
//     required,
//     email,
//     min,
//     max,
//     minlength,
//     maxlength,
//     pattern,
//     url,
//     date,
//     password,
//     list,
//     set,
//     eq,
//     diff,
//     lt,
//     lte,
//     gt,
//     gte,
//     type,
//     step,
//   };
//   return decoratorMap[name] || null;
// }
//
// // Utility function to find differences between models
// async function findDifferences(instance1: any, instance2: any): Promise<any[]> {
//   const differences = [];
//   const serialized1 = JSON.parse(instance1.serialize());
//   const serialized2 = JSON.parse(instance2.serialize());
//
//   for (const key in serialized1) {
//     if (serialized1[key] !== serialized2[key]) {
//       differences.push({
//         field: key,
//         value1: serialized1[key],
//         value2: serialized2[key],
//       });
//     }
//   }
//
//   return differences;
// }
//
// // Start the server
// server.start({
//   transportType: "stdio",
// });
//
// export { server };
