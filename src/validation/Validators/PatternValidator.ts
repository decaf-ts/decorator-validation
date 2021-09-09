import Validator from "./Validator";
import {ValidationKeys, DEFAULT_ERROR_MESSAGES} from "../constants";
import {Errors} from "../types";

/**
 * Pattern Validator
 *
 * @class PatternValidator
 * @extends Validator
 * @memberOf Validators
 */
export default class PatternValidator extends Validator {
    private static readonly regexpParser: RegExp = new RegExp("^\/(.+)\/([gimus]*)$");

    constructor(key: string = ValidationKeys.PATTERN, message: string = DEFAULT_ERROR_MESSAGES.PATTERN){
        super(key, message);
    }

    private static getPattern(pattern: string): RegExp {
        if (!PatternValidator.regexpParser.test(pattern))
            return new RegExp(pattern);
        const match: any = pattern.match(PatternValidator.regexpParser);
        return new RegExp(match[1], match[2]);
    }

    public hasErrors(value: string, pattern: RegExp | string, message?: string): Errors {
        if (!value)
            return;
        pattern = typeof pattern === 'string' ? PatternValidator.getPattern(pattern) : pattern;
        return !pattern.test(value) ? this.getMessage(message || this.message) : undefined;
    }
}