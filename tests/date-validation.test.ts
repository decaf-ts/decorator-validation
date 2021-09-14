import Model from "../src/Model/Model";
import {max, min, date} from "../src/validation/decorators";
import {twoDigitPad} from "../src";
import {ValidationKeys} from "../src/validation/constants";

class TestModel extends Model {

    @date('dd/MM/yyyy')
    @max('2022/01/01')
    @min(new Date('2020/01/01'))
    dateProp?: Date = undefined;

    constructor(model?: TestModel | {}) {
        super();
        Model.constructFromObject<TestModel>(this, model);
    }
}

describe('Date Integration', function() {

    const date = new Date();
    const dm = new TestModel({
        dateProp: date
    });

    it('Properly overrides the value', function() {
        expect(dm.dateProp).toBeDefined();
        expect(dm.dateProp).toEqual(date);
    });

    it('properly overrides the serialization', () => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const expected = `${twoDigitPad(day)}/${twoDigitPad(month)}/${year}`;
        expect(dm.dateProp?.toISOString()).toEqual(expected);
        expect(JSON.stringify(dm)).toEqual(`{\"dateProp\":\"${expected}\"}`);
    });

    it('Properly recognizes invalid types nad overrides the design:type default type checking', function() {
        const dm2 = new TestModel({
            dateProp: "new Date()"
        });

        const errors = dm2.hasErrors();
        expect(errors).toBeDefined();
        if (!errors)
            return;

        expect(Object.keys(errors).length).toEqual(1);
        const keys = Object.keys(errors[Object.keys(errors)[0]]);
        expect(keys.length).toEqual(1);
        expect(keys[0]).toEqual(ValidationKeys.DATE)
    });
});