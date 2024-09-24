/**
 * @summary Util function to provide string format functionality similar to C#'s string.format
 *
 * @param {string} string
 * @param {Array<string | number>} [args] replacements made by order of appearance (replacement0 wil replace {0} and so on)
 * @return {string} formatted string
 *
 * @function stringFormat
 * @memberOf module:decorator-validation.Utils.Format
 * @category Format
 */
export function stringFormat(string: string, ...args: (string | number)[]) {
  return string.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] !== "undefined"
      ? args[number].toString()
      : "undefined";
  });
}

/**
 * @summary Util function to provide string format functionality similar to C#'s string.format
 * @description alias for {@link stringFormat}
 *
 * @param {string} string
 * @param {string} args replacements made by order of appearance (replacement0 wil replace {0} and so on)
 * @return {string} formatted string
 *
 * @function sf
 * @memberOf module:decorator-validation.Utils.Format
 * @category Format
 */
export const sf = stringFormat;
