import {hashCode, hashObj} from '../src/utils';

describe('Hashing methods', function() {
    it('hashes a string', function() {
        const testString = "this is test string";
        const h = hashCode(testString);
        expect(h).toBe(1579028267);
    });

    it('hashes an object', () => {
        const d = new Date('01/01/2021');
        const dummyObj = {key: 1};
        const dummyArr = [1, 5];
        const otherDummyArr = [
            dummyObj,
            1,
            "test",
            dummyArr
        ];
        const obj = {
            name: 'name',
            number: 10,
            date: d,
            arr: otherDummyArr
        }

        const h = hashObj(obj);

        expect(h).toBe(1400398082);
    });
});