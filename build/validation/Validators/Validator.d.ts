import Validatable, { Errors } from "../types";
export default abstract class Validator implements Validatable {
    readonly validationKey: string;
    protected message: string;
    protected constructor(validationKey: string, message?: string);
    protected getMessage(message: string, ...args: any[]): string;
    abstract hasErrors(value: any, ...args: any[]): Errors;
}
//# sourceMappingURL=Validator.d.ts.map