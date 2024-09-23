import {isEqual} from "@decaf-ts/reflection";

describe("date functions", () => {
    it("Properly compares dates", () => {
        const date1 = new Date();
        const date2 = new Date(date1);
        expect(date1.getTime()).toEqual(date2.getTime())
        expect(isEqual(date1, date2)).toEqual(true);
    })

    it("Properly compares objects and primitives", () => {
        const obj = {}
        const primitive = 2
        expect(isEqual(obj, primitive)).toEqual(false);
    })
})