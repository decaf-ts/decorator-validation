export type DateTarget = Date | DateBuilder;

export type OffsetValues = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function resolveTarget(target: DateTarget): Date {
  if (target instanceof DateBuilder) return target.build();
  return new Date(target);
}

export function offsetDate(
  date: Date,
  direction: 1 | -1,
  values: OffsetValues
) {
  const computed = new Date(date);
  if (values.years)
    computed.setFullYear(computed.getFullYear() + direction * values.years);
  if (values.months)
    computed.setMonth(computed.getMonth() + direction * values.months);
  if (values.days)
    computed.setDate(computed.getDate() + direction * values.days);
  if (values.hours)
    computed.setHours(computed.getHours() + direction * values.hours);
  if (values.minutes)
    computed.setMinutes(computed.getMinutes() + direction * values.minutes);
  if (values.seconds)
    computed.setSeconds(computed.getSeconds() + direction * values.seconds);
  return computed;
}

/**
 * Fluent builder for producing dates relative to a reference point.
 */
export class DateBuilder {
  private years = 0;
  private months = 0;
  private days = 0;
  private hours = 0;
  private minutes = 0;
  private seconds = 0;

  private constructor() {}

  static Years(value: number) {
    return new DateBuilder().Years(value);
  }

  static Months(value: number) {
    return new DateBuilder().Months(value);
  }

  static Days(value: number) {
    return new DateBuilder().Days(value);
  }

  static Hours(value: number) {
    return new DateBuilder().Hours(value);
  }

  static Minutes(value: number) {
    return new DateBuilder().Minutes(value);
  }

  static Seconds(value: number) {
    return new DateBuilder().Seconds(value);
  }

  Years(value: number) {
    this.years += value;
    return this;
  }

  Months(value: number) {
    this.months += value;
    return this;
  }

  Days(value: number) {
    this.days += value;
    return this;
  }

  Hours(value: number) {
    this.hours += value;
    return this;
  }

  Minutes(value: number) {
    this.minutes += value;
    return this;
  }

  Seconds(value: number) {
    this.seconds += value;
    return this;
  }

  build(reference: DateTarget = new Date()) {
    return this.from(reference);
  }

  from(reference: DateTarget) {
    return offsetDate(resolveTarget(reference), 1, this.offsets());
  }

  past(reference: DateTarget) {
    return this.from(reference);
  }

  after(reference: DateTarget) {
    return this.from(reference);
  }

  until(reference: DateTarget) {
    return offsetDate(resolveTarget(reference), -1, this.offsets());
  }

  before(reference: DateTarget) {
    return this.until(reference);
  }

  private offsets(): OffsetValues {
    return {
      years: this.years,
      months: this.months,
      days: this.days,
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds,
    };
  }
}

export const Dates = DateBuilder;

export const Now = () => new Date();

export const Tomorrow = () => DateBuilder.Days(1).from(Now());

export const Yesterday = () => DateBuilder.Days(1).until(Now());

export const DaysAgo = (count: number) => DateBuilder.Days(count).until(Now());

export const NextDays = (count: number) => DateBuilder.Days(count).from(Now());

export const YearsAgo = (count: number) =>
  DateBuilder.Years(count).until(Now());

export const NextYears = (count: number) =>
  DateBuilder.Years(count).from(Now());

export const MonthsAgo = (count: number) =>
  DateBuilder.Months(count).until(Now());

export const NextMonths = (count: number) =>
  DateBuilder.Months(count).from(Now());

export const HoursAgo = (count: number) =>
  DateBuilder.Hours(count).until(Now());

export const NextHours = (count: number) =>
  DateBuilder.Hours(count).from(Now());

export const MinutesAgo = (count: number) =>
  DateBuilder.Minutes(count).until(Now());

export const NextMinutes = (count: number) =>
  DateBuilder.Minutes(count).from(Now());

export const SecondsAgo = (count: number) =>
  DateBuilder.Seconds(count).until(Now());

export const NextSeconds = (count: number) =>
  DateBuilder.Seconds(count).from(Now());
