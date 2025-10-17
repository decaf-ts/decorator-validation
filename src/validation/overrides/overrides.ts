import { Metadata } from "@decaf-ts/decoration";
import { ValidationKeys } from "../Validators/index";
import { ModelKeys } from "../../utils/index";

(Metadata as any).decorate = {
  class<V>(decorator: V, key: string): void {
    Metadata.set(
      ValidationKeys.DECORATION,
      Metadata.key(ModelKeys.MODEL, key),
      decorator
    );
  },
  property<V>(decorator: V, key: string): void {
    Metadata.set(
      ValidationKeys.DECORATION,
      Metadata.key(ModelKeys.ATTRIBUTE, key),
      decorator
    );
  },
};

(Metadata as any).decoration = {
  forClass(key?: string) {
    return Metadata["innerGet"](
      Symbol.for(ValidationKeys.DECORATION),
      key ? Metadata.key(ModelKeys.MODEL, key) : ModelKeys.MODEL
    );
  },
  forProperty(key?: string) {
    return Metadata["innerGet"](
      Symbol.for(ValidationKeys.DECORATION),
      key ? Metadata.key(ModelKeys.ATTRIBUTE, key) : ModelKeys.ATTRIBUTE
    );
  },
};
