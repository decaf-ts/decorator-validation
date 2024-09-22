import "reflect-metadata";
import { MONTH_NAMES } from "../validation/Validators/constants";

/**
 * @summary Reverses the process from {@link formatDate}
 *
 * @param {string} date the date string to be converted back into date
 * @param {string} format the date format
 * @return {Date} the date from the format or the standard new Date({@prop date}) if the string couldn't be parsed (are you sure the format matches the string?)
 *
 * @function dateFromFormat
 * @memberOf module:decorator-validation.Utils.Dates
 * @category Format
 */
export function dateFromFormat(date: string, format: string) {
  let formatRegexp: string = format;

  // Hour
  if (formatRegexp.match(/hh/))
    formatRegexp = formatRegexp.replace("hh", "(?<hour>\\d{2})");
  else if (formatRegexp.match(/h/))
    formatRegexp = formatRegexp.replace("h", "(?<hour>\\d{1,2})");
  else if (formatRegexp.match(/HH/))
    formatRegexp = formatRegexp.replace("HH", "(?<hour>\\d{2})");
  else if (formatRegexp.match(/H/))
    formatRegexp = formatRegexp.replace("H", "(?<hour>\\d{1,2})");

  // Minutes
  if (formatRegexp.match(/mm/))
    formatRegexp = formatRegexp.replace("mm", "(?<minutes>\\d{2})");
  else if (formatRegexp.match(/m/))
    formatRegexp = formatRegexp.replace("m", "(?<minutes>\\d{1,2})");

  // Seconds
  if (formatRegexp.match(/ss/))
    formatRegexp = formatRegexp.replace("ss", "(?<seconds>\\d{2})");
  else if (formatRegexp.match(/s/))
    formatRegexp = formatRegexp.replace("s", "(?<seconds>\\d{1,2})");

  // Day
  if (formatRegexp.match(/dd/))
    formatRegexp = formatRegexp.replace("dd", "(?<day>\\d{2})");
  else if (formatRegexp.match(/d/))
    formatRegexp = formatRegexp.replace("d", "(?<day>\\d{1,2})");

  // Day Of Week
  if (formatRegexp.match(/EEEE/))
    formatRegexp = formatRegexp.replace("EEEE", "(?<dayofweek>\\w+)");
  else if (formatRegexp.match(/EEEE/))
    formatRegexp = formatRegexp.replace("EEE", "(?<dayofweek>\\w+)");

  // Year
  if (formatRegexp.match(/yyyy/))
    formatRegexp = formatRegexp.replace("yyyy", "(?<year>\\d{4})");
  else if (formatRegexp.match(/yy/))
    formatRegexp = formatRegexp.replace("yy", "(?<year>\\d{2})");

  // Month
  if (formatRegexp.match(/MMMM/))
    formatRegexp = formatRegexp.replace("MMMM", "(?<monthname>\\w+)");
  else if (formatRegexp.match(/MMM/))
    formatRegexp = formatRegexp.replace("MMM", "(?<monthnamesmall>\\w+)");
  if (formatRegexp.match(/MM/))
    formatRegexp = formatRegexp.replace("MM", "(?<month>\\d{2})");
  else if (formatRegexp.match(/M/))
    formatRegexp = formatRegexp.replace("M", "(?<month>\\d{1,2})");

  // Milis and Am Pm
  formatRegexp = formatRegexp
    .replace("S", "(?<milis>\\d{1,3})")
    .replace("aaa", "(?<ampm>\\w{2})");

  const regexp = new RegExp(formatRegexp, "g");

  const match: {
    groups: {
      year?: string;
      day?: string;
      ampm?: string;
      hour?: string;
      minutes?: string;
      seconds?: string;
      milis?: string;
      monthname?: string;
      monthnamesmall?: string;
      month?: string;
    };
  } = regexp.exec(date) as any;

  if (!match || !match.groups) return new Date(date);

  const safeParseInt = function (n?: string) {
    if (!n) return 0;
    const result = parseInt(n);

    return isNaN(result) ? 0 : result;
  };

  const year = safeParseInt(match.groups.year);
  const day = safeParseInt(match.groups.day);

  const amPm = match.groups.ampm;
  let hour = safeParseInt(match.groups.hour);

  if (amPm) hour = amPm === "PM" ? hour + 12 : hour;

  const minutes = safeParseInt(match.groups.minutes);
  const seconds = safeParseInt(match.groups.seconds);
  const ms = safeParseInt(match.groups.milis);

  const monthName = match.groups.monthname;
  const monthNameSmall = match.groups.monthnamesmall;
  let month: number | string = match.groups.month as string;
  if (monthName) month = MONTH_NAMES.indexOf(monthName);
  else if (monthNameSmall) {
    const m = MONTH_NAMES.find((m) =>
      m.toLowerCase().startsWith(monthNameSmall.toLowerCase()),
    );
    if (!m) return new Date(date);
    month = MONTH_NAMES.indexOf(m);
  } else month = safeParseInt(`${month}`);

  return new Date(year, month - 1, day, hour, minutes, seconds, ms);
}
