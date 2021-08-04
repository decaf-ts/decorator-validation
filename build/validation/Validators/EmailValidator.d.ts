import { Errors } from "../types";
import PatternValidator from "./PatternValidator";
export default class EmailValidator extends PatternValidator {
    private static readonly emailPat;
    constructor(message?: string);
    hasErrors(value: string, message?: string): Errors;
}
//# sourceMappingURL=EmailValidator.d.ts.map