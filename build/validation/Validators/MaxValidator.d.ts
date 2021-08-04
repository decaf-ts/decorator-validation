import Validator from "./Validator";
import { Errors } from "../types";
export default class MaxValidator extends Validator {
    constructor(message?: string);
    hasErrors(value: number, max: number, message?: string): Errors;
}
//# sourceMappingURL=MaxValidator.d.ts.map