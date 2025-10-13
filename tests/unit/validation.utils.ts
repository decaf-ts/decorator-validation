import "reflect-metadata";
import {
  async,
  AsyncValidator,
  innerValidationDecorator,
  list,
  maxlength,
  min,
  minlength,
  model,
  Model,
  ModelArg,
  required,
  validator,
  ValidatorOptions,
} from "../../src";
import { Decoration, propMetadata } from "@decaf-ts/decoration";

export function isPromise(obj: any): boolean {
  return (
    !!obj && typeof obj.then === "function" && typeof obj.catch === "function"
  );
}

export const TIMEOUT_VALIDATION_KEY = "timeout";
export const TIMEOUT_ERROR_MESSAGE = "Timeout reached";
export const CUSTOM_VALIDATION_ERROR_MESSAGE = "Custom validation error";

export interface TimeoutValidatorOptions extends ValidatorOptions {
  timeout?: number;
}

@validator(TIMEOUT_VALIDATION_KEY)
export class TimeoutValidator extends AsyncValidator<any> {
  constructor(message: string = "Custom validation error") {
    super(message);
  }

  public async hasErrors(
    value?: any,
    options?: any
  ): Promise<string | undefined> {
    const delay = options?.timeout ?? 100;

    if (value > delay) {
      return this.getMessage(options?.message || this.message);
    }

    await new Promise((res) => setTimeout(res, delay));
    return undefined;
  }
}

export function timeout(
  message: string = TIMEOUT_ERROR_MESSAGE,
  value?: number
) {
  const key = TIMEOUT_VALIDATION_KEY;
  const meta: any = {
    [TIMEOUT_VALIDATION_KEY]: value,
    message: message,
    description: `defines a timeout value for the property`,
    async: true,
  };
  return Decoration.for(key)
    .define({
      decorator: innerValidationDecorator,
      args: [timeout, key, meta],
    })
    .apply();
}

@model()
export class ShippingModel extends Model {
  @required()
  carrier!: string;

  @required()
  estimatedDays!: number;

  constructor(model?: ModelArg<ShippingModel>) {
    super(model);
  }
}

@async()
@model()
export class OrderItemModel extends Model<true> {
  @timeout()
  @required()
  @min(50)
  processingTime!: number;

  @list(String)
  @minlength(2)
  // @required()
  tags!: string[];

  @required()
  shippingInfo!: ShippingModel;

  @list(ShippingModel)
  @maxlength(2)
  tracking!: ShippingModel[];

  constructor(model?: ModelArg<OrderItemModel>) {
    super(model);
    Model.fromObject<OrderItemModel>(this, model);
  }
}

@model()
@async()
export class OrderModel extends Model<true> {
  @timeout(CUSTOM_VALIDATION_ERROR_MESSAGE)
  orderProcessingDelay!: number;

  @required()
  mainItem!: OrderItemModel;

  @list(OrderItemModel)
  @minlength(1)
  @maxlength(3)
  additionalItems!: OrderItemModel[];

  constructor(model?: ModelArg<OrderModel>) {
    super(model);
    Model.fromObject<OrderModel>(this, model);
  }
}
