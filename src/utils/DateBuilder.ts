type DateBuilderField =
  | "Years"
  | "Months"
  | "Days"
  | "Hours"
  | "Minutes"
  | "Seconds";

export type DateBuilderInstance = DateBuilder<DateBuilderField>;

export type DateTarget = Date | DateBuilderInstance;

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

type RemoveField<
  Input extends DateBuilderField,
  Field extends DateBuilderField,
> = Input extends Field ? never : Input;

interface DateBuilderUtilityMethods {
  Now(): Date;
  Tomorrow(): Date;
  Yesterday(): Date;
  DaysAgo(count: number): Date;
  NextDays(count: number): Date;
  YearsAgo(count: number): Date;
  NextYears(count: number): Date;
  MonthsAgo(count: number): Date;
  NextMonths(count: number): Date;
  HoursAgo(count: number): Date;
  NextHours(count: number): Date;
  MinutesAgo(count: number): Date;
  NextMinutes(count: number): Date;
  SecondsAgo(count: number): Date;
  NextSeconds(count: number): Date;
}

interface DateBuilderCoreMethods extends DateBuilderUtilityMethods {
  build(reference?: DateTarget): Date;
  from(reference: DateTarget): Date;
  past(reference: DateTarget): Date;
  after(reference: DateTarget): Date;
  until(reference: DateTarget): Date;
  before(reference: DateTarget): Date;
  ago(reference?: DateTarget): Date;
}

export type DateBuilderChain<
  Remaining extends DateBuilderField = DateBuilderField,
> = DateBuilderCoreMethods & {
  [Field in Remaining]: (
    value: number
  ) => DateBuilderChain<RemoveField<Remaining, Field>>;
};

/**
 * Fluent builder for producing dates relative to a reference point.
 */
export class DateBuilder<Remaining extends DateBuilderField = DateBuilderField>
  implements DateBuilderCoreMethods
{
  private years = 0;
  private months = 0;
  private days = 0;
  private hours = 0;
  private minutes = 0;
  private seconds = 0;

  private constructor() {}

  static Years(
    value: number
  ): DateBuilderChain<RemoveField<DateBuilderField, "Years">> {
    return new DateBuilder().Years(value);
  }

  static Months(
    value: number
  ): DateBuilderChain<RemoveField<DateBuilderField, "Months">> {
    return new DateBuilder().Months(value);
  }

  static Days(
    value: number
  ): DateBuilderChain<RemoveField<DateBuilderField, "Days">> {
    return new DateBuilder().Days(value);
  }

  static Hours(
    value: number
  ): DateBuilderChain<RemoveField<DateBuilderField, "Hours">> {
    return new DateBuilder().Hours(value);
  }

  static Minutes(
    value: number
  ): DateBuilderChain<RemoveField<DateBuilderField, "Minutes">> {
    return new DateBuilder().Minutes(value);
  }

  static Seconds(
    value: number
  ): DateBuilderChain<RemoveField<DateBuilderField, "Seconds">> {
    return new DateBuilder().Seconds(value);
  }

  static Now() {
    return new Date();
  }

  static Tomorrow() {
    return DateBuilder.Days(1).from(DateBuilder.Now());
  }

  static Yesterday() {
    return DateBuilder.Days(1).until(DateBuilder.Now());
  }

  static DaysAgo(count: number) {
    return DateBuilder.Days(count).until(DateBuilder.Now());
  }

  static NextDays(count: number) {
    return DateBuilder.Days(count).from(DateBuilder.Now());
  }

  static YearsAgo(count: number) {
    return DateBuilder.Years(count).until(DateBuilder.Now());
  }

  static NextYears(count: number) {
    return DateBuilder.Years(count).from(DateBuilder.Now());
  }

  static MonthsAgo(count: number) {
    return DateBuilder.Months(count).until(DateBuilder.Now());
  }

  static NextMonths(count: number) {
    return DateBuilder.Months(count).from(DateBuilder.Now());
  }

  static HoursAgo(count: number) {
    return DateBuilder.Hours(count).until(DateBuilder.Now());
  }

  static NextHours(count: number) {
    return DateBuilder.Hours(count).from(DateBuilder.Now());
  }

  static MinutesAgo(count: number) {
    return DateBuilder.Minutes(count).until(DateBuilder.Now());
  }

  static NextMinutes(count: number) {
    return DateBuilder.Minutes(count).from(DateBuilder.Now());
  }

  static SecondsAgo(count: number) {
    return DateBuilder.Seconds(count).until(DateBuilder.Now());
  }

  static NextSeconds(count: number) {
    return DateBuilder.Seconds(count).from(DateBuilder.Now());
  }

  Years(value: number): DateBuilderChain<RemoveField<Remaining, "Years">> {
    this.years += value;
    return this as unknown as DateBuilderChain<RemoveField<Remaining, "Years">>;
  }

  Months(value: number): DateBuilderChain<RemoveField<Remaining, "Months">> {
    this.months += value;
    return this as unknown as DateBuilderChain<
      RemoveField<Remaining, "Months">
    >;
  }

  Days(value: number): DateBuilderChain<RemoveField<Remaining, "Days">> {
    this.days += value;
    return this as unknown as DateBuilderChain<RemoveField<Remaining, "Days">>;
  }

  Hours(value: number): DateBuilderChain<RemoveField<Remaining, "Hours">> {
    this.hours += value;
    return this as unknown as DateBuilderChain<RemoveField<Remaining, "Hours">>;
  }

  Minutes(value: number): DateBuilderChain<RemoveField<Remaining, "Minutes">> {
    this.minutes += value;
    return this as unknown as DateBuilderChain<
      RemoveField<Remaining, "Minutes">
    >;
  }

  Seconds(value: number): DateBuilderChain<RemoveField<Remaining, "Seconds">> {
    this.seconds += value;
    return this as unknown as DateBuilderChain<
      RemoveField<Remaining, "Seconds">
    >;
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

  ago(reference: DateTarget = new Date()) {
    return this.until(reference);
  }

  Now() {
    return DateBuilder.Now();
  }

  Tomorrow() {
    return DateBuilder.Tomorrow();
  }

  Yesterday() {
    return DateBuilder.Yesterday();
  }

  DaysAgo(count: number) {
    return DateBuilder.DaysAgo(count);
  }

  NextDays(count: number) {
    return DateBuilder.NextDays(count);
  }

  YearsAgo(count: number) {
    return DateBuilder.YearsAgo(count);
  }

  NextYears(count: number) {
    return DateBuilder.NextYears(count);
  }

  MonthsAgo(count: number) {
    return DateBuilder.MonthsAgo(count);
  }

  NextMonths(count: number) {
    return DateBuilder.NextMonths(count);
  }

  HoursAgo(count: number) {
    return DateBuilder.HoursAgo(count);
  }

  NextHours(count: number) {
    return DateBuilder.NextHours(count);
  }

  MinutesAgo(count: number) {
    return DateBuilder.MinutesAgo(count);
  }

  NextMinutes(count: number) {
    return DateBuilder.NextMinutes(count);
  }

  SecondsAgo(count: number) {
    return DateBuilder.SecondsAgo(count);
  }

  NextSeconds(count: number) {
    return DateBuilder.NextSeconds(count);
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

export const Now = () => DateBuilder.Now();

export const Tomorrow = () => DateBuilder.Tomorrow();

export const Yesterday = () => DateBuilder.Yesterday();

export const DaysAgo = (count: number) => DateBuilder.DaysAgo(count);

export const NextDays = (count: number) => DateBuilder.NextDays(count);

export const YearsAgo = (count: number) => DateBuilder.YearsAgo(count);

export const NextYears = (count: number) => DateBuilder.NextYears(count);

export const MonthsAgo = (count: number) => DateBuilder.MonthsAgo(count);

export const NextMonths = (count: number) => DateBuilder.NextMonths(count);

export const HoursAgo = (count: number) => DateBuilder.HoursAgo(count);

export const NextHours = (count: number) => DateBuilder.NextHours(count);

export const MinutesAgo = (count: number) => DateBuilder.MinutesAgo(count);

export const NextMinutes = (count: number) => DateBuilder.NextMinutes(count);

export const SecondsAgo = (count: number) => DateBuilder.SecondsAgo(count);

export const NextSeconds = (count: number) => DateBuilder.NextSeconds(count);
