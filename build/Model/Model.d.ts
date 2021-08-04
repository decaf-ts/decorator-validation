import Validatable, { Errors } from "../validation/types";
export default abstract class Model implements Validatable {
    protected constructor(model?: Model | {});
    hasErrors(...args: any[]): Errors;
    equals(obj: any, ...exceptions: string[]): boolean;
    static constructFromObject<T extends Model>(self: T, obj?: T | {}): T;
}
//# sourceMappingURL=Model.d.ts.map