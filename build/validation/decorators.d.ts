import "reflect-metadata";
export declare const getValidationKey: (key: string) => string;
export declare const required: (message?: string) => (target: any, propertyKey: string) => void;
export declare const min: (value: number | Date | string, message?: string) => (target: Object, propertyKey: string) => void;
export declare const max: (value: number | Date | string, message?: string) => (target: Object, propertyKey: string) => void;
export declare const minlength: (value: number, message?: string) => (target: Object, propertyKey: string) => void;
export declare const maxlength: (value: number, message?: string) => (target: Object, propertyKey: string) => void;
export declare const pattern: (value: RegExp | string, message?: string) => (target: Object, propertyKey: string) => void;
export declare const email: (message?: string) => (target: Object, propertyKey: string) => void;
export declare const url: (message?: string) => (target: Object, propertyKey: string) => void;
//# sourceMappingURL=decorators.d.ts.map