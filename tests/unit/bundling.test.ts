import {ModelKeys, Model} from "../../src"; // at least one import is needed so the file is considered a module byt jest
const a = ModelKeys.MODEL

describe("Distribution Tests", () => {
    it ("reads lib", () => {
        try {
            const {ValidationKeys} = require("../../lib/index.cjs");
            expect(ValidationKeys).toBeDefined();
        } catch (e) {
            expect(e).toBeUndefined();
        }

    })

    it("reads JS Bundle", () => {
        try {
            const {ValidationKeys} = require("../../dist/decorator-validation.bundle.min.js");
            expect(ValidationKeys).toBeDefined();
        } catch (e) {
            expect(e).toBeUndefined();
        }
    })
})