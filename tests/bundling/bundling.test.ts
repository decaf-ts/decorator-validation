import { ModelKeys } from "../../src";
import { Dirent } from "fs";
const a = ModelKeys.MODEL;

describe("Distribution Tests", () => {
  it("reads lib", () => {
    try {
      const {
        ValidationKeys,
        Validation,
        MinValidator,
        Validator,
      } = require("../../lib/index.cjs");
      expect(ValidationKeys).toBeDefined();
      expect(Validation).toBeDefined();
      expect(MinValidator).toBeDefined();
      expect(Validator).toBeDefined();
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });

  it("reads JS Bundle", () => {
    try {
      let distFile: Dirent[];
      try {
        distFile = require("fs")
          .readdirSync(require("path").join(process.cwd(), "dist"), {
            withFileTypes: true,
          })
          .filter((d: Dirent) => d.isFile() && d.name.endsWith(".js"));
      } catch (e: unknown) {
        throw new Error("Error reading JS bundle: " + e);
      }

      if (distFile.length === 0)
        throw new Error("There should only be a js file in directory");

      const { ValidationKeys, Validation, MinValidator, Validator } = require(
        `../../dist/${distFile[0].name}`
      );
      expect(ValidationKeys).toBeDefined();
      expect(Validation).toBeDefined();
      expect(MinValidator).toBeDefined();
      expect(Validator).toBeDefined();
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });
});
