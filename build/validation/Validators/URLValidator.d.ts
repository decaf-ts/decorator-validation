import { Errors } from "../types";
import PatternValidator from "./PatternValidator";
export default class URLValidator extends PatternValidator {
    private static readonly urlPattern;
    constructor(message?: string);
    hasErrors(value: string, message?: string): Errors;
}
//# sourceMappingURL=URLValidator.d.ts.map