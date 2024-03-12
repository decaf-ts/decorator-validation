import { BaseError } from "./BaseError";

export class SerializationError extends BaseError {
  constructor(msg: string | Error) {
    super(msg);
  }
}
