import Model from "../src/Model/Model";
import "reflect-metadata";
import {Errors, getValidatorRegistry, Decorators, constructFromObject} from "../src";
import Validator from "../src/validation/Validators/Validator";
import {required} from '../src/validation/decorators';
const {getValidationKey} = Decorators;


function generateGtin(){
    function pad(num: number, width: number, padding: string = '0') {
        const n = num + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(padding) + n;
    }

    const beforeChecksum = pad(Math.floor(Math.random() * 9999999999999), 13); // has to be 13. the checksum is the 4th digit
    const checksum = calculateGtinCheckSum(beforeChecksum);
    return `${beforeChecksum}${checksum}`;
}

// https://www.gs1.org/services/how-calculate-check-digit-manually
function calculateGtinCheckSum(digits: string) : string{
    digits = '' + digits;
    if (digits.length !== 13)
        throw new Error(`needs to received 13 digits`);
    const multiplier = [3,1,3,1,3,1,3,1,3,1,3,1,3];
    let sum = 0;
    try {
        // multiply each digit for its multiplier according to the table
        for (let i = 0; i < 13; i++)
            sum += parseInt(digits.charAt(i)) * multiplier[i];

        // Find the nearest equal or higher multiple of ten
        const remainder = sum % 10;
        let nearest;
        if (remainder  === 0)
            nearest = sum;
        else
            nearest = sum - remainder + 10;

        return nearest - sum + '';
    } catch (e){
        throw new Error(`Did this received numbers? ${e}`);
    }
}

const CUSTOM_VALIDATION_KEY = "gtin";
const CUSTOM_VALIDATION_ERROR_MESSAGE = "Not a valid Gtin"
const CUSTOM_VALIDATION_REQUIRED_ERROR_MESSAGE = "Gtin is required"

class GtinValidator extends Validator{
    constructor(message: string = CUSTOM_VALIDATION_ERROR_MESSAGE) {
        super(CUSTOM_VALIDATION_KEY, message);
    }

    hasErrors(value: number | string, message?: string): Errors{
        if (value === undefined)
            return;
        const gtin = value + '';
        if (!gtin.match(/\d{14}/g))
            return this.getMessage(message || this.message);

        const digits = gtin.slice(0, 13);
        const checksum = calculateGtinCheckSum(digits);
        return parseInt(checksum) === parseInt(gtin.charAt(13)) ? undefined : this.getMessage(message || this.message);
    }
}

const gtin = (message: string = CUSTOM_VALIDATION_ERROR_MESSAGE) => (target: any, propertyKey: string) => {
    required(CUSTOM_VALIDATION_REQUIRED_ERROR_MESSAGE)(target, propertyKey);
    Reflect.defineMetadata(
        getValidationKey(CUSTOM_VALIDATION_KEY),
        {
            message: message,
            types: ['string', 'number']
        },
        target,
        propertyKey
    );
    getValidatorRegistry().register({validator: GtinValidator, validationKey: CUSTOM_VALIDATION_KEY});
}

class TestModel extends Model {

    @gtin()
    customProp?: number | string = undefined;

    constructor(model?: TestModel | {}) {
        super();
        constructFromObject<TestModel>(this, model);
    }
}

describe('Validation with custom decorators test', function() {
    const validGtin = generateGtin();
    const invalidGtin = '0000000000000';

    it('Invalid test', function() {
        const dm = new TestModel({
            customProp: invalidGtin
        });

        const errors = dm.hasErrors();
        expect(errors).toBeDefined();
        if (errors){
            expect(Object.keys(errors)).toBeInstanceOf(Array);
            expect(Object.keys(errors).length).toBe(1);
            expect(errors.toString()).toBe(CUSTOM_VALIDATION_ERROR_MESSAGE);
        }
    });

    it('Invalid inner required test', function() {
        const dm = new TestModel();

        const errors = dm.hasErrors();
        expect(errors).toBeDefined();
        if (errors){
            expect(Object.keys(errors)).toBeInstanceOf(Array);
            expect(Object.keys(errors).length).toBe(1);
            expect(errors.toString()).toBe(CUSTOM_VALIDATION_REQUIRED_ERROR_MESSAGE);
        }
    });

    it('Valid test', function() {
        const dm = new TestModel({
            customProp: validGtin
        });

        getValidatorRegistry().register(new GtinValidator());

        const errors = dm.hasErrors();
        expect(errors).toBeUndefined();
    });
});