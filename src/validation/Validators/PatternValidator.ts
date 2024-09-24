import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { validator } from "./decorators";

export const regexpParser: RegExp = new RegExp("^/(.+)/([gimus]*)$");

/**
 * @summary Pattern Validator
 *
 * @param {string} [key] defaults to {@link ValidationKeys#PATTERN}
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#PATTERN}
 *
 * @class PatternValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.PATTERN)
export class PatternValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.PATTERN) {
    super(message, "string");
  }

  /**
   * @summary parses and validates a pattern
   *
   * @param {string} pattern
   * @private
   */
  private getPattern(pattern: string): RegExp {
    if (!regexpParser.test(pattern)) return new RegExp(pattern);
    const match: any = pattern.match(regexpParser);
    return new RegExp(match[1], match[2]);
  }

  /**
   * @summary Validates a Model
   *
   * @param {string} value
   * @param {RegExp | string} pattern
   * @param {string} [message]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: string,
    pattern?: RegExp | string,
    message?: string,
  ): string | undefined {
    if (!value) return;
    if (!pattern) throw new Error("Missing Pattern");
    pattern = typeof pattern === "string" ? this.getPattern(pattern) : pattern;
    pattern.lastIndex = 0; // resets pattern position for repeat validation requests
    return !pattern.test(value)
      ? this.getMessage(message || this.message)
      : undefined;
  }
}
