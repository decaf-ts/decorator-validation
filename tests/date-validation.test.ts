import Model from "../src/Model/Model";
import {max, min, date} from "../src/validation/decorators";

class TestModel extends Model {

    @date('dd/mm/YYYY')
    @max('2022/01/01')
    @min(new Date('2020/01/01'))
    dateProp?: Date = undefined;

    constructor(model?: TestModel | {}) {
        super();
        console.log(`entering TESRTMODEL constructor`)

        Model.constructFromObject<TestModel>(this, model);
        console.log(`exiting TESTMODEL constructor`)

    }
}

describe('Date Integration', function() {
    it('Targets the correct class', function() {
        const date = new Date();
        const dm = new TestModel({
            dateProp: date
        });
        expect(dm.dateProp).toBeDefined();
        expect(dm.dateProp).toEqual(date);
    });

    it('Invalid test', function() {
        const dm = new TestModel({
            dateProp: new Date()
        });

        const errors = dm.hasErrors();
        expect(errors).toBeDefined();
    });
});