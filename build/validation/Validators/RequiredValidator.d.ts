import Validator from "./Validator";
import { Errors } from "../types";
export default class RequiredValidator extends Validator {
    constructor(message?: string);
    hasErrors(value: any, message?: string): Errors;
}
//# sourceMappingURL=RequiredValidator.d.ts.map