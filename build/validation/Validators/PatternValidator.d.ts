import Validator from "./Validator";
import { Errors } from "../types";
export default class PatternValidator extends Validator {
    private static readonly regexpParser;
    constructor(key?: string, message?: string);
    private getPattern;
    hasErrors(value: string, pattern: RegExp | string, message?: string): Errors;
}
//# sourceMappingURL=PatternValidator.d.ts.map