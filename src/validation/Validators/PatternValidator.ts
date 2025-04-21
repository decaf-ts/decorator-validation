import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";
import { PatternValidatorOptions } from "../types";

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
export class PatternValidator extends Validator<PatternValidatorOptions> {
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
   * @param {PatternValidatorOptions} options
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: string,
    options: PatternValidatorOptions
  ): string | undefined {
    if (!value) return;

    let { pattern } = options;
    if (!pattern) throw new Error("Missing Pattern");
    pattern = typeof pattern === "string" ? this.getPattern(pattern) : pattern;
    pattern.lastIndex = 0; // resets pattern position for repeat validation requests
    return !pattern.test(value)
      ? this.getMessage(options.message || this.message)
      : undefined;
  }
}
