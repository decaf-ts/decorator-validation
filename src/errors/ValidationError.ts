import { BaseError } from "./BaseError";

export class ValidationError extends BaseError {
  constructor(msg: string | Error) {
    super(msg);
  }
}
