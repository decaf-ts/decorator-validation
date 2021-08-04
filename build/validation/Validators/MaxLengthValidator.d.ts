import { Errors } from "../types";
import Validator from "./Validator";
export default class MaxLengthValidator extends Validator {
    constructor(message?: string);
    hasErrors(value: string, maxlength: number, message?: string): Errors;
}
//# sourceMappingURL=MaxLengthValidator.d.ts.map