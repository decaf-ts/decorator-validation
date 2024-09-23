import "reflect-metadata"
import {metadata} from "@decaf-ts/reflection";

describe("reflections", () => {
    describe("@metadata", () => {
        const key = 'key',
            value = 'value';

        @metadata(key, value)
        class ClassMetadataTest {}

        class StaticMethodMetadataTest {
            @metadata(key, value)
            public static test() {}
        }

        class MethodMetadataTest {
            @metadata(key, value)
            public test() {}
        }

        class PropertyMetadataTest {
            @metadata(key, value)
            test: string = "";
        }

        it('should enhance class with expected metadata', () => {
            const metadata = Reflect.getMetadata(key, ClassMetadataTest);
            expect(metadata).toEqual(value);
        });

        it('should enhance method with expected metadata', () => {
            const metadata = Reflect.getMetadata(key, StaticMethodMetadataTest.test);
            expect(metadata).toEqual(value);
        });

        it('should enhance instance method with expected metadata', () => {
            const instance = new MethodMetadataTest();
            const metadata = Reflect.getMetadata(key, instance.test);
            expect(metadata).toEqual(value);
        });

        it('should enhance instance property with expected metadata', () => {
            const instance = new PropertyMetadataTest();
            const metadata = Reflect.getMetadata(key, instance, "test");
            expect(metadata).toEqual(value);
        });
    })
})