import Validator from "./Validator";
import { Errors } from "../types";
export default class MinLengthValidator extends Validator {
    constructor(message?: string);
    hasErrors(value: string, minlength: number, message?: string): Errors;
}
//# sourceMappingURL=MinLengthValidator.d.ts.map