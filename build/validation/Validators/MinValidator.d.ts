import Validator from "./Validator";
import { Errors } from "../types";
export default class MinValidator extends Validator {
    constructor(message?: string);
    hasErrors(value: number, min: number, message?: string): Errors;
}
//# sourceMappingURL=MinValidator.d.ts.map