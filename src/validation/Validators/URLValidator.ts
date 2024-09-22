import {
  ValidationKeys,
  DEFAULT_ERROR_MESSAGES,
  DEFAULT_PATTERNS,
} from "./constants";
import { Errors } from "../types";
import { PatternValidator } from "./PatternValidator";
import { validator } from "./decorators";

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
    super(ValidationKeys.URL, message);
  }

  /**
   * @summary Validates a model
   *
   * @param {string} value
   * @param {string} [message]
   *
   * @return Errors
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  public hasErrors(value: string, message?: string): Errors {
    return super.hasErrors(value, DEFAULT_PATTERNS.URL, message);
  }
}
