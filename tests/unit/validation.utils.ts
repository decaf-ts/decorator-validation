import "reflect-metadata";
import {
  async,
  AsyncValidator,
  list,
  maxlength,
  min,
  minlength,
  model,
  Model,
  ModelArg,
  propMetadata,
  required,
  Validation,
  ValidationMetadata,
  validator,
  ValidatorOptions,
} from "../../src";

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
export class TimeoutValidator extends AsyncValidator<{
  message: string;
  timeout?: number;
  async?: boolean;
}> {
  constructor(message: string = TIMEOUT_ERROR_MESSAGE) {
    super(message);
  }

  async hasErrors(
    value: number,
    options?: TimeoutValidatorOptions
  ): Promise<string | undefined> {
    const delay = options?.timeout ?? 100;

    if (value > delay) {
      return this.getMessage(options?.message || this.message);
    }

    await new Promise((res) => setTimeout(res, delay));
    return undefined;
  }
}

export const timeout = (message: string = TIMEOUT_ERROR_MESSAGE) => {
  return propMetadata<ValidationMetadata>(
    Validation.key(TIMEOUT_VALIDATION_KEY),
    {
      message: message,
      types: ["number"],
      async: true,
    }
  );
};

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
