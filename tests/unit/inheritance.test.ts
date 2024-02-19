import {constructFromObject, required, Model, model} from "../../src";
import {getPropertyDecorators, hashObj} from "../../src";

type Callback = (...args: any) => void;

class Test1 extends Model{
    @required()
    prop?: string = undefined;

    constructor(obj?: Test1 | {}) {
        super()
        constructFromObject(this, obj);
    }
}

class Test2 extends Test1{
    @required()
    prop2?: string = undefined;

    constructor(obj?: Test2 | {}) {
        super(obj)
        constructFromObject(this, obj);
    }
}

@model()
class Test3 extends Test2 {
    constructor(obj?: Test3 | {}) {
        super(obj);
    }
}

class Test4 extends Test2 {
    constructor(obj?: Test4 | {}) {
        super(obj);
    }
}

describe('inheritance Test', () => {

    it("maintains inheritance prototypal structure", () => {
        const tm3 = new Test3();
        const tm4 = new Test4();

        function getInheritanceStructure(model: any, accum?: string[]): string[]{
            const prot = Object.getPrototypeOf(model);
            accum = accum || [];
            accum.push(prot.constructor.name);
            if (prot === Object.prototype)
                return accum;
            return getInheritanceStructure(prot, accum);
        }

        const is3 = getInheritanceStructure(tm3)
        const is4 = getInheritanceStructure(tm4)

        expect(is4).toEqual(expect.arrayContaining(["Test4", "Test2", "Test1", "Model"]))
        expect(is3).toEqual(expect.arrayContaining(["Test3", "Test2", "Test1", "Model"]))

    })

    it("maintains constructor names", () => {

        class OperationsRegistry {
            private cache: { [indexer: string]: any } = {};

            /**
             *
             * @param {string | {}} target
             * @param {string} propKey
             * @param {string} operation
             * @param {OperationHandler[]} [accum] used internally for caching previous
             * @return {OperationHandler[] | undefined}
             */
            get<OperationHandler>(target: string | Record<string, any>, propKey: string, operation: string, accum?: OperationHandler[]): OperationHandler[] | undefined {
                accum = accum || [];
                let name
                try{
                    name = typeof target === "string" ? target : target.constructor.name;
                    accum.push(...(Object.values(this.cache[name][propKey][operation] as OperationHandler[] || [])));
                } catch (e) {
                    if (typeof target === 'string' || Object.getPrototypeOf(target) === Object.prototype)
                        return accum;
                }

                let proto = Object.getPrototypeOf(target);
                if (proto.constructor.name === name)
                    proto = Object.getPrototypeOf(proto)

                return this.get(proto, propKey, operation, accum);
            }

            /**
             *
             * @param {OperationHandler} handler
             * @param {string} operation
             * @param {{}} target
             * @param {string | symbol} propKey
             * @param {}
             */
            register<OperationHandler>(handler: OperationHandler, operation: string, target: { [indexer: string]: any }, propKey: string | symbol): void {
                const name = target.constructor.name;
                let handlerName = hashObj(handler as Record<string, any>).toString();

                if (!this.cache[name])
                    this.cache[name] = {};
                if (!this.cache[name][propKey])
                    this.cache[name][propKey] = {};
                if (!this.cache[name][propKey][operation])
                    this.cache[name][propKey][operation] = {};
                if (this.cache[name][propKey][operation][handlerName])
                    return;
                this.cache[name][propKey][operation][handlerName] = handler;
            }
        }

        const registry = new OperationsRegistry();
        class Decorators{
            static on = (operation: string[], handler: any, args: any[] = [], ...props: string[]) => (target: any, propertyKey: string) => {
                const name = target.constructor.name;
                operation.forEach(op => {
                    op = "on." + op;
                    let metadata = Reflect.getMetadata(op, target, propertyKey);
                    if (!metadata)
                        metadata = {
                            operation: op,
                            handlers: {}
                        }

                    const handlerKey = hashObj((handler as Record<string, any>)).toString();

                    if (!metadata.handlers[name] || !metadata.handlers[name][propertyKey] || !(handlerKey in metadata.handlers[name][propertyKey])) {
                        metadata.handlers[name] = metadata.handlers[name] || {};
                        metadata.handlers[name][propertyKey] = metadata.handlers[name][propertyKey] || {};
                        metadata.handlers[name][propertyKey][handlerKey] = {
                            args: args,
                            props: props
                        };

                        Reflect.defineMetadata(
                            op,
                            metadata,
                            target,
                            propertyKey
                        );
                    }

                    registry.register(handler, op, target, propertyKey)
                });
            }
        }

        const decoratorMock: any = jest.spyOn(Decorators, "on")

        class Handler {
            static handler1 = function(key: string, model: any, callback: Callback){
                model["updatedOn"] = "handler1"
                callback(undefined, model)
            }

            static handler2 = function(key: string, model: any, callback: Callback){
                model["updatedOn"] = "handler2"
                callback(undefined, model)
            }
        }

        const mock: any = jest.spyOn(Handler, "handler1")
        Object.defineProperty(mock, "name", {value: "mock"});                          // making sure the function names are different since the hash will be the same

        const otherMock: any = jest.spyOn(Handler, "handler2");
        Object.defineProperty(otherMock, "name", {value: "otherMock"});                          // making sure the function names are different since the hash will be the same

        class BaseModel extends Model {
            @Decorators.on(["create"], Handler.handler1)
            updatedOn?: string = undefined;

            constructor(baseModel?: BaseModel | {}) {
                super();
                constructFromObject<BaseModel>(this, baseModel);
            }
        }

        class OverriddenBaseModel extends BaseModel {
            @Decorators.on(["create"], Handler.handler2)
            override updatedOn?: string = undefined;

            constructor(overriddenBaseModel?: OverriddenBaseModel | {}) {
                super(overriddenBaseModel);
                constructFromObject<OverriddenBaseModel>(this, overriddenBaseModel);
            }

        }

        @model()
        class OtherBaseModel extends OverriddenBaseModel{
            constructor(otherBaseModel?: OtherBaseModel | {}) {
                super(otherBaseModel);
            }
        }

        expect(decoratorMock).toHaveBeenCalledTimes(2);

        const overRidden = new OverriddenBaseModel();
        expect(overRidden).toBeDefined()

        const decorators = getPropertyDecorators("on.create", overRidden, "updatedOn", true)

        expect(decorators).toBeDefined();
        expect(decorators?.decorators).toBeDefined();
        expect(decorators?.decorators.length).toEqual(1)
        const handlers = registry.get(overRidden, "updatedOn", "on.create") as any[];
        expect(handlers).toBeDefined()
        expect(handlers?.length).toEqual(2)

        handlers.reverse().forEach(h => {
            h("", overRidden, (err: any, model: OverriddenBaseModel) => console.log(err, model))
        })

        expect(overRidden?.updatedOn).toBeDefined();
        expect(overRidden?.updatedOn).toEqual("handler2")

        const other = new OtherBaseModel();

        expect(other).toBeDefined()

        const otherDecorators = getPropertyDecorators("on.create", other, "updatedOn", true)

        expect(otherDecorators).toBeDefined();
        expect(otherDecorators?.decorators).toBeDefined();
        expect(otherDecorators?.decorators.length).toEqual(1)
        const otherHandlers = registry.get(other, "updatedOn", "on.create") as any[];
        expect(otherHandlers).toBeDefined()
        expect(otherHandlers?.length).toEqual(2)

        otherHandlers.reverse().forEach(h => {
            h("", other, (err: any, model: OtherBaseModel) => console.log(err, model))
        })

        expect(other?.updatedOn).toBeDefined();
        expect(other?.updatedOn).toEqual("handler2")

    })

    it('validates with one level of inheritance', () => {
        const t = new Test2({
            prop2: "something"
        })

        expect (t.hasErrors()).toBeDefined()

        const t2 = new Test2({
            prop: "something"
        })

        expect (t2.hasErrors()).toBeDefined()

        const t3 = new Test2({
            prop: "something",
            prop2: "something"
        })

        expect (t3.hasErrors()).toBeUndefined()
    })

    it('validates with two levels of inheritance', () => {
        const t = new Test3({
            prop2: "something"
        })

        expect (t.hasErrors()).toBeDefined()

        const t2 = new Test3({
            prop: "something"
        })

        expect (t2.hasErrors()).toBeDefined()

        const t3 = new Test3({
            prop: "something",
            prop2: "something"
        })

        expect (t3.hasErrors()).toBeUndefined()
    })
})