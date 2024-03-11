import { Validator } from "./Validator";
import { ValidationKeys, DEFAULT_ERROR_MESSAGES } from "./constants";
import { Errors } from "../types";

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
export class PatternValidator extends Validator {
  private static readonly regexpParser: RegExp = new RegExp(
    "^/(.+)/([gimus]*)$",
  );

  constructor(
    key: string = ValidationKeys.PATTERN,
    message: string = DEFAULT_ERROR_MESSAGES.PATTERN,
  ) {
    super(key, message, "string");
  }

  /**
   * @summary parses and validates a pattern
   *
   * @param {string} pattern
   * @private
   */
  private static getPattern(pattern: string): RegExp {
    if (!PatternValidator.regexpParser.test(pattern))
      return new RegExp(pattern);
    const match: any = pattern.match(PatternValidator.regexpParser);
    return new RegExp(match[1], match[2]);
  }

  /**
   * @summary Validates a Model
   *
   * @param {string} value
   * @param {RegExp | string} pattern
   * @param {string} [message]
   *
   * @return Errors
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: string,
    pattern: RegExp | string,
    message?: string,
  ): Errors {
    if (!value) return;
    pattern =
      typeof pattern === "string"
        ? PatternValidator.getPattern(pattern)
        : pattern;
    pattern.lastIndex = 0; // resets pattern position for repeat validation requests
    return !pattern.test(value)
      ? this.getMessage(message || this.message)
      : undefined;
  }
}
