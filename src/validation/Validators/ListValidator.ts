import { Validator } from "./Validator";
import { DEFAULT_ERROR_MESSAGES, ValidationKeys } from "./constants";
import { validator } from "./decorators";

/**
 * @summary List Validator
 *
 * @param {string} [message] defaults to {@link DEFAULT_ERROR_MESSAGES#LIST}
 *
 * @class ListValidator
 * @extends Validator
 *
 * @category Validators
 */
@validator(ValidationKeys.LIST)
export class ListValidator extends Validator {
  constructor(message: string = DEFAULT_ERROR_MESSAGES.LIST) {
    super(message, Array.name, Set.name);
  }

  /**
   * @summary Validates a model
   *
   * @param {any[] | Set<any>} value
   * @param {string} clazz
   * @param {string} [message]
   *
   * @return Errors
   *
   * @override
   *
   * @see Validator#hasErrors
   */
  hasErrors(
    value: any[] | Set<any>,
    clazz: string,
    message?: string,
  ): string | undefined {
    if (!value || (Array.isArray(value) ? !value.length : !value.size)) return;

    let val;
    for (
      let i = 0;
      i < (Array.isArray(value) ? value.length : value.size);
      i++
    ) {
      val = (value as any)[i];
      switch (typeof val) {
        case "object":
        case "function":
          if (
            !(val as object).constructor ||
            (val as object).constructor.name !== clazz
          )
            return this.getMessage(message || this.message, clazz);
          break;
        default:
          if (typeof val !== clazz)
            return this.getMessage(message || this.message, clazz);
      }
    }

    return undefined;
  }
}
