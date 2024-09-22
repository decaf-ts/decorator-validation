import {metadata} from "reflect-metadata/no-conflict";
import "reflect-metadata"

describe("reflections", () => {
    describe("@metadata", () => {
        const key = 'key',
            value = 'value';

        @metadata(key, value)
        class Test {}

        class TestWithMethod {
            @metadata(key, value)
            public static test() {}
        }

        it('should enhance class with expected metadata', () => {
            const metadata = Reflect.getMetadata(key, Test);
            expect(metadata).toEqual(value);
        });

        it('should enhance method with expected metadata', () => {
            const metadata = Reflect.getMetadata(key, TestWithMethod.test);
            expect(metadata).toEqual(value);
        });
    })
})