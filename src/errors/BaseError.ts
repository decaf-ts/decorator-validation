export class BaseError extends Error {
  constructor(msg: string | Error) {
    if (msg instanceof BaseError) return msg;
    // noinspection TypeScriptValidateTypes
    super(
      msg instanceof Error ? msg.message : msg,
      msg instanceof Error
        ? {
            cause: msg,
          }
        : undefined,
    );
  }
}
