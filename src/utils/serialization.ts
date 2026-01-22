import { Constructor } from "@decaf-ts/decoration";
import { Serializer } from "./types";
import { DefaultSerializationMethod } from "./constants";

export class Serialization {
  private static current: string = DefaultSerializationMethod;

  private static cache: Record<string, Serializer<any>>;

  private constructor() {}

  private static get(key: string): any {
    if (key in this.cache) return this.cache[key];
    throw new Error(`No serialization method registered under ${key}`);
  }

  static register(
    key: string,
    func: Constructor<Serializer<any>>,
    setDefault = false
  ): void {
    if (key in this.cache)
      throw new Error(`Serialization method ${key} already registered`);
    this.cache[key] = new func();
    if (setDefault) this.current = key;
  }

  static serialize(obj: any, method?: string, ...args: any[]) {
    if (!method) return this.get(this.current).serialize(obj, ...args);
    return this.get(method).serialize(obj, ...args);
  }

  static deserialize(obj: string, method?: string, ...args: any[]) {
    if (!method) return this.get(this.current).deserialize(obj, ...args);
    return this.get(method).deserialize(obj, ...args);
  }

  static setDefault(method: string) {
    this.current = this.get(method);
  }
}
