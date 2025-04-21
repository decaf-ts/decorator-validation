import {
  ValidationKeys,
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_PATTERNS,
} from "./constants";
import { PatternValidator } from "./PatternValidator";
import { validator } from "./decorators";
import { PatternValidatorOptions } from "./types";

/**
 * @summary URL Validator
 * @description Pattern from {@link https://gist.github.com/dperini/729294}
 *
 * @class URLValidator
 * @extends PatternValidator
 *
 * @category Validators
 */
@validator(ValidationKeys.URL)
export class URLValidator extends PatternValidator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.URL) {
    super(message);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {PatternValidatorOptions} [options={}]
   *
   * @return {string | undefined}
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(
    value: string,
    options: PatternValidatorOptions = {}
  ): string | undefined {
    return super.hasErrors(value, {
      ...options,
      pattern: options.pattern || DEFAULT_PATTERNS.URL,
    });
  }
}
