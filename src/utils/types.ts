import { Model } from "../model";

export interface DecorationBuilderBuild {
  apply(): (
    target: object,
    propertyKey?: any,
    descriptor?: TypedPropertyDescriptor<any>
  ) => any;
}

export interface DecorationBuilderEnd {
  extend(
    ...decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[]
  ): DecorationBuilderBuild;
}

export interface DecorationBuilderMid extends DecorationBuilderEnd {
  define(
    ...decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[]
  ): DecorationBuilderEnd & DecorationBuilderBuild;
}

export interface DecorationBuilderStart {
  for(id: string): DecorationBuilderMid;
}

export interface IDecorationBuilder
  extends DecorationBuilderStart,
    DecorationBuilderMid,
    DecorationBuilderEnd,
    DecorationBuilderBuild {}

export type FlavourResolver = (target: object) => string;

/**
 * @summary Helper in serialization
 *
 * @interface Serializer
 * @category Serialization
 */
export interface Serializer<T extends Model> {
  /**
   * @summary Serializes a model
   * @param {T} model
   *
   * @param args
   * @method
   *
   * @throws {Error}
   */
  serialize(model: T, ...args: any[]): string;

  /**
   * @summary Rebuilds a model from serialization
   * @param {string} str
   *
   * @param args
   * @method
   *
   * @throws {Error}
   */
  deserialize(str: string, ...args: any[]): T;
}
