import {
  DateBuilder,
  DaysAgo,
  HoursAgo,
  MinutesAgo,
  MonthsAgo,
  NextDays,
  NextHours,
  NextMinutes,
  NextMonths,
  NextSeconds,
  NextYears,
  Now,
  SecondsAgo,
  Tomorrow,
  Yesterday,
  YearsAgo,
} from "../../src/utils/DateBuilder";

describe("DateBuilder core offsets", () => {
  const anchor = new Date(2020, 0, 1, 0, 0, 0);

  it("applies increments with from", () => {
    const result = DateBuilder.Years(1)
      .Months(2)
      .Days(3)
      .Hours(4)
      .Minutes(5)
      .Seconds(6)
      .from(anchor);
    expect(result).toEqual(new Date(2021, 2, 4, 4, 5, 6));
  });

  it("subtracts offsets with until", () => {
    const expected = new Date(anchor);
    expected.setFullYear(expected.getFullYear() - 1);
    expected.setMonth(expected.getMonth() - 1);
    expected.setDate(expected.getDate() - 1);
    expected.setHours(expected.getHours() - 1);
    expected.setMinutes(expected.getMinutes() - 1);
    expected.setSeconds(expected.getSeconds() - 1);

    const result = DateBuilder.Years(1)
      .Months(1)
      .Days(1)
      .Hours(1)
      .Minutes(1)
      .Seconds(1)
      .until(anchor);
    expect(result).toEqual(expected);
  });

  it("aliases past/after to from", () => {
    const base = DateBuilder.Days(2).from(anchor);
    expect(DateBuilder.Days(2).past(anchor)).toEqual(base);
    expect(DateBuilder.Days(2).after(anchor)).toEqual(base);
  });

  it("aliases before to until", () => {
    const base = DateBuilder.Days(3).until(anchor);
    expect(DateBuilder.Days(3).before(anchor)).toEqual(base);
  });

  it("build defaults to now when no reference provided", () => {
    jest.useFakeTimers().setSystemTime(new Date(2022, 1, 1, 10, 0, 0).getTime());
    const expected = new Date(2022, 1, 1, 10, 0, 0);
    expected.setDate(expected.getDate() + 1);
    expect(DateBuilder.Days(1).build()).toEqual(expected);
    jest.useRealTimers();
  });
});

describe("DateBuilder helper utilities", () => {
  const frozenNow = new Date(2023, 5, 15, 12, 0, 0);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(frozenNow.getTime());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("Now mirrors the system time", () => {
    expect(Now()).toEqual(frozenNow);
  });

  it("Tomorrow adds one day", () => {
    const expected = new Date(frozenNow);
    expected.setDate(expected.getDate() + 1);
    expect(Tomorrow()).toEqual(expected);
  });

  it("Yesterday subtracts one day", () => {
    const expected = new Date(frozenNow);
    expected.setDate(expected.getDate() - 1);
    expect(Yesterday()).toEqual(expected);
  });

  it("NextDays moves forward by the requested amount", () => {
    const expected = new Date(frozenNow);
    expected.setDate(expected.getDate() + 5);
    expect(NextDays(5)).toEqual(expected);
  });

  it("DaysAgo moves backward by the requested amount", () => {
    const expected = new Date(frozenNow);
    expected.setDate(expected.getDate() - 5);
    expect(DaysAgo(5)).toEqual(expected);
  });

  it("NextYears adds years", () => {
    const expected = new Date(frozenNow);
    expected.setFullYear(expected.getFullYear() + 2);
    expect(NextYears(2)).toEqual(expected);
  });

  it("YearsAgo subtracts years", () => {
    const expected = new Date(frozenNow);
    expected.setFullYear(expected.getFullYear() - 2);
    expect(YearsAgo(2)).toEqual(expected);
  });

  it("NextMonths adds months", () => {
    const expected = new Date(frozenNow);
    expected.setMonth(expected.getMonth() + 3);
    expect(NextMonths(3)).toEqual(expected);
  });

  it("MonthsAgo subtracts months", () => {
    const expected = new Date(frozenNow);
    expected.setMonth(expected.getMonth() - 3);
    expect(MonthsAgo(3)).toEqual(expected);
  });

  it("NextHours adds hours", () => {
    const expected = new Date(frozenNow);
    expected.setHours(expected.getHours() + 4);
    expect(NextHours(4)).toEqual(expected);
  });

  it("HoursAgo subtracts hours", () => {
    const expected = new Date(frozenNow);
    expected.setHours(expected.getHours() - 4);
    expect(HoursAgo(4)).toEqual(expected);
  });

  it("NextMinutes adds minutes", () => {
    const expected = new Date(frozenNow);
    expected.setMinutes(expected.getMinutes() + 10);
    expect(NextMinutes(10)).toEqual(expected);
  });

  it("MinutesAgo subtracts minutes", () => {
    const expected = new Date(frozenNow);
    expected.setMinutes(expected.getMinutes() - 10);
    expect(MinutesAgo(10)).toEqual(expected);
  });

  it("NextSeconds adds seconds", () => {
    const expected = new Date(frozenNow);
    expected.setSeconds(expected.getSeconds() + 30);
    expect(NextSeconds(30)).toEqual(expected);
  });

  it("SecondsAgo subtracts seconds", () => {
    const expected = new Date(frozenNow);
    expected.setSeconds(expected.getSeconds() - 30);
    expect(SecondsAgo(30)).toEqual(expected);
  });
});
