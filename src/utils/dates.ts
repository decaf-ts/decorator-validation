import "reflect-metadata";
import {
  DAYS_OF_WEEK_NAMES,
  MONTH_NAMES,
} from "../validation/Validators/constants";
import { sf } from "./strings";

/**
 * @summary Reverses the process from {@link formatDate}
 *
 * @param {string} date the date string to be converted back into date
 * @param {string} format the date format
 * @return {Date} the date from the format or the standard new Date({@prop date}) if the string couldn't be parsed (are you sure the format matches the string?)
 *
 * @function dateFromFormat
 * @memberOf module:decorator-validation
 * @category Model
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
  // eslint-disable-next-line no-dupe-else-if
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
      m.toLowerCase().startsWith(monthNameSmall.toLowerCase())
    );
    if (!m) return new Date(date);
    month = MONTH_NAMES.indexOf(m);
  } else month = safeParseInt(`${month}`);

  return new Date(year, month - 1, day, hour, minutes, seconds, ms);
}

/**
 * @description Binds a specific date format to a Date object's toString and toISOString methods
 * @summary Modifies a Date object to return a formatted string when toString or toISOString is called.
 * This function overrides the default toString and toISOString methods of the Date object to return
 * the date formatted according to the specified format string.
 * @param {Date} [date] The Date object to modify
 * @param {string} [format] The format string to use for formatting the date
 * @return {Date|undefined} The modified Date object or undefined if no date was provided
 * @function bindDateToString
 * @memberOf module:decorator-validation
 * @category Model
 */
export function bindDateToString(date: Date | undefined, format: string) {
  if (!date) return;
  const func = () => formatDate(date, format);
  Object.defineProperty(date, "toISOString", {
    enumerable: false,
    configurable: false,
    value: func,
  });
  Object.defineProperty(date, "toString", {
    enumerable: false,
    configurable: false,
    value: func,
  });
  // Object.setPrototypeOf(date, Date.prototype);
  return date;
}

/**
 * @description Safely checks if a value is a valid Date object
 * @summary A utility function that determines if a value is a valid Date object.
 * This function is more reliable than using instanceof Date as it also checks
 * that the date is not NaN, which can happen with invalid date strings.
 * @param {any} date The value to check
 * @return {boolean} True if the value is a valid Date object, false otherwise
 * @function isValidDate
 * @memberOf module:decorator-validation
 * @category Validation
 */
export function isValidDate(date: any): boolean {
  return (
    date &&
    Object.prototype.toString.call(date) === "[object Date]" &&
    !Number.isNaN(date)
  );
}

/**
 * @summary Util function to pad numbers
 * @param {number} num
 *
 * @return {string}
 *
 * @function twoDigitPad
 * @memberOf module:decorator-validation
 * @category Model
 */
export function twoDigitPad(num: number): string {
  return num < 10 ? "0" + num : num.toString();
}

/**
 * @summary Date Format Handling
 * @description Code from {@link https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date}
 *
 * <pre>
 *      Using similar formatting as Moment.js, Class DateTimeFormatter (Java), and Class SimpleDateFormat (Java),
 *      I implemented a comprehensive solution formatDate(date, patternStr) where the code is easy to read and modify.
 *      You can display date, time, AM/PM, etc.
 *
 *      Date and Time Patterns
 *      yy = 2-digit year; yyyy = full year
 *      M = digit month; MM = 2-digit month; MMM = short month name; MMMM = full month name
 *      EEEE = full weekday name; EEE = short weekday name
 *      d = digit day; dd = 2-digit day
 *      h = hours am/pm; hh = 2-digit hours am/pm; H = hours; HH = 2-digit hours
 *      m = minutes; mm = 2-digit minutes; aaa = AM/PM
 *      s = seconds; ss = 2-digit seconds
 *      S = miliseconds
 * </pre>
 *
 * @param {Date} date
 * @param {string} [patternStr] defaults to 'yyyy/MM/dd'
 * @return {string} the formatted date
 *
 * @function formatDate
 * @memberOf module:decorator-validation
 * @category Model
 */
export function formatDate(date: Date, patternStr: string = "yyyy/MM/dd") {
  const day: number = date.getDate(),
    month: number = date.getMonth(),
    year: number = date.getFullYear(),
    hour: number = date.getHours(),
    minute: number = date.getMinutes(),
    second: number = date.getSeconds(),
    miliseconds: number = date.getMilliseconds(),
    h: number = hour % 12,
    hh: string = twoDigitPad(h),
    HH: string = twoDigitPad(hour),
    mm: string = twoDigitPad(minute),
    ss: string = twoDigitPad(second),
    aaa: string = hour < 12 ? "AM" : "PM",
    EEEE: string = DAYS_OF_WEEK_NAMES[date.getDay()],
    EEE: string = EEEE.substr(0, 3),
    dd: string = twoDigitPad(day),
    M: number = month + 1,
    MM: string = twoDigitPad(M),
    MMMM: string = MONTH_NAMES[month],
    MMM: string = MMMM.substr(0, 3),
    yyyy: string = year + "",
    yy: string = yyyy.substr(2, 2);
  // checks to see if month name will be used
  patternStr = patternStr
    .replace("hh", hh)
    .replace("h", h.toString())
    .replace("HH", HH)
    .replace("H", hour.toString())
    .replace("mm", mm)
    .replace("m", minute.toString())
    .replace("ss", ss)
    .replace("s", second.toString())
    .replace("S", miliseconds.toString())
    .replace("dd", dd)
    .replace("d", day.toString())

    .replace("EEEE", EEEE)
    .replace("EEE", EEE)
    .replace("yyyy", yyyy)
    .replace("yy", yy)
    .replace("aaa", aaa);
  if (patternStr.indexOf("MMM") > -1) {
    patternStr = patternStr.replace("MMMM", MMMM).replace("MMM", MMM);
  } else {
    patternStr = patternStr.replace("MM", MM).replace("M", M.toString());
  }
  return patternStr;
}

/**
 * @summary Parses a date from a specified format
 * @param {string} format
 * @param {string | Date | number} [v]
 * @memberOf module:decorator-validation
 * @category Model
 */
export function parseDate(format: string, v?: string | Date | number) {
  let value: Date | undefined = undefined;

  if (!v) return undefined;

  if (v instanceof Date)
    try {
      value = dateFromFormat(formatDate(v as Date, format), format);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      throw new Error(
        sf("Could not convert date {0} to format: {1}", v.toString(), format)
      );
    }
  else if (typeof v === "string") {
    value = dateFromFormat(v, format);
  } else if (typeof v === "number") {
    const d = new Date(v);
    value = dateFromFormat(formatDate(d, format), format);
  } else if (isValidDate(v)) {
    try {
      const d = new Date(v);
      value = dateFromFormat(formatDate(d, format), format);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new Error(
        sf("Could not convert date {0} to format: {1}", v, format)
      );
    }
  } else {
    throw new Error(`Invalid value provided ${v}`);
  }
  return bindDateToString(value, format);
}
