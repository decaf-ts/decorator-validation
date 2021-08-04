import Validator from "./Validators/Validator";
export declare type Errors = string | string[] | undefined;
export declare type Registry = {
    register(...validator: typeof Validator[] | Validator[]): void;
    getValidator(name: string): Validator;
};
export default interface Validatable {
    hasErrors(...args: any[]): Errors;
}
//# sourceMappingURL=types.d.ts.map