import { ModelKeys, Model } from "../../src";
import { Dirent } from "fs";
import fs from "fs";
import path from "path"; // at least one import is needed so the file is considered a module byt jest
const a = ModelKeys.MODEL;

describe("Distribution Tests", () => {
  it("reads lib", () => {
    try {
      const { ValidationKeys } = require("../../lib/index.cjs");
      expect(ValidationKeys).toBeDefined();
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

      const { ValidationKeys } = require(`../../dist/${distFile[0].name}`);
      expect(ValidationKeys).toBeDefined();
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });
});
