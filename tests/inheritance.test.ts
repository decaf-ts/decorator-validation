import {required} from "../src/validation/decorators";
import {Model} from "../src/model/Model";
import {constructFromObject} from "../src";

class Test1 {
    @required()
    prop?: string = undefined;

    constructor(obj: Test1 | {}) {
        // @ts-ignore
        constructFromObject(this, obj);
    }
}

class Test2 extends Test1{
    @required()
    prop2?: string = undefined;

    constructor(obj: Test2 | {}) {
        super({obj})
        // @ts-ignore
        constructFromObject(this, obj);
    }
}

describe('inheritance Test', () => {
    it('handles 2 targets', () => {
        const test = new Test2({
            prop: "prop",
            prop2: "prop2"
        });
    })
})