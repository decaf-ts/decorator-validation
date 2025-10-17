import "@decaf-ts/decoration";

type DecorationInput = {
  class<V>(decorator: V, key: string): void;
  property<V>(decorator: V, key: string): void;
};

type DecorationOutput = {
  forClass(): Record<string, ClassDecorator>;
  forClass(key: string): ClassDecorator;
  forClass(key?: string): Record<string, ClassDecorator> | ClassDecorator;
  forProperty(): Record<string, PropertyDecorator>;
  forProperty(key: string): PropertyDecorator;
  forProperty(
    key?: string
  ): Record<string, PropertyDecorator> | PropertyDecorator;
};

declare module "@decaf-ts/decoration" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Metadata {
    const decorate: DecorationInput;
    const decoration: DecorationOutput;
  }
}
