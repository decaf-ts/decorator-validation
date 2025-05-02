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

export const DefaultFlavour = "decaf";

export type FlavourResolver = (target: object) => string;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function defaultFlavourResolver(target: object) {
  return DefaultFlavour;
}

/**
 * @description A decorator management class that handles flavoured decorators
 * @summary The Decoration class provides a builder pattern for creating and managing decorators with different flavours.
 * It supports registering, extending, and applying decorators with context-aware flavour resolution.
 *
 * @template T Type of the decorator (ClassDecorator | PropertyDecorator | MethodDecorator)
 *
 * @param {string} [flavour] Optional flavour parameter for the decorator context
 *
 * @class
 *
 * @example
 * ```typescript
 * // Create a new decoration for 'component' with default flavour
 * const componentDecorator = new Decoration()
 *   .for('component')
 *   .define(customComponentDecorator);
 *
 * // Create a flavoured decoration
 * const vueComponent = new Decoration('vue')
 *   .for('component')
 *   .define(vueComponentDecorator);
 *
 * // Apply the decoration
 * @componentDecorator
 * class MyComponent {}
 * ```
 *
 * @mermaid
 * sequenceDiagram
 *   participant C as Client
 *   participant D as Decoration
 *   participant R as FlavourResolver
 *   participant F as DecoratorFactory
 *
 *   C->>D: new Decoration(flavour)
 *   C->>D: for(key)
 *   C->>D: define(decorators)
 *   D->>D: register(key, flavour, decorators)
 *   D->>F: decoratorFactory(key, flavour)
 *   F->>R: resolve(target)
 *   R-->>F: resolved flavour
 *   F->>F: apply decorators
 *   F-->>C: decorated target
 */
export class Decoration implements IDecorationBuilder {
  /**
   * @description Static map of registered decorators
   * @summary Stores all registered decorators organized by key and flavour
   */
  private static decorators: Record<
    string,
    Record<
      string,
      {
        decorators?: Set<ClassDecorator | PropertyDecorator | MethodDecorator>;
        extras?: Set<ClassDecorator | PropertyDecorator | MethodDecorator>;
      }
    >
  > = {};

  /**
   * @description Function to resolve flavour from a target
   * @summary Resolver function that determines the appropriate flavour for a given target
   */
  private static flavourResolver: FlavourResolver = () => DefaultFlavour;

  /**
   * @description Set of decorators for the current context
   */
  private decorators?: Set<
    ClassDecorator | PropertyDecorator | MethodDecorator
  >;

  /**
   * @description Set of additional decorators
   */
  private extras?: Set<ClassDecorator | PropertyDecorator | MethodDecorator>;

  /**
   * @description Current decorator key
   */
  private key?: string;

  /**
   * @description Creates a new Decoration instance
   * @param {string} [flavour=DefaultFlavour] The flavour for the decoration
   */
  constructor(private flavour: string = DefaultFlavour) {}

  /**
   * @description Sets the key for the decoration builder
   * @summary Initializes a new decoration chain with the specified key
   * @param {string} key The identifier for the decorator
   * @return {DecorationBuilderMid} Builder instance for method chaining
   */
  for(key: string): DecorationBuilderMid {
    this.key = key;
    return this;
  }

  /**
   * @description Adds decorators to the current context
   * @summary Internal method to add decorators with addon support
   * @param {boolean} [addon=false] Whether the decorators are addons
   * @param {(ClassDecorator | PropertyDecorator | MethodDecorator)[]} decorators Array of decorators
   * @return {this} Current instance for chaining
   */
  private decorate(
    addon: boolean = false,
    ...decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[]
  ): this {
    if (!this.key)
      throw new Error("key must be provided before decorators can be added");
    if (!addon && !this.decorators && this.flavour !== DefaultFlavour)
      throw new Error(
        "Must provide overrides or addons to override or extend decaf's decorators"
      );
    if (this.flavour === DefaultFlavour && addon)
      throw new Error("Default flavour cannot be extended");

    this[addon ? "extras" : "decorators"] = new Set([
      ...(this[addon ? "extras" : "decorators"] || new Set()).values(),
      ...decorators,
    ]);

    return this;
  }

  /**
   * @description Defines the base decorators
   * @summary Sets the primary decorators for the current context
   * @param {(ClassDecorator | PropertyDecorator | MethodDecorator)[]} decorators Decorators to define
   * @return {DecorationBuilderEnd & DecorationBuilderBuild} Builder instance for finishing the chain
   */
  define(
    ...decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[]
  ): DecorationBuilderEnd & DecorationBuilderBuild {
    return this.decorate(false, ...decorators);
  }

  /**
   * @description Extends existing decorators
   * @summary Adds additional decorators to the current context
   * @param {(ClassDecorator | PropertyDecorator | MethodDecorator)[]} decorators Additional decorators
   * @return {DecorationBuilderBuild} Builder instance for building the decorator
   */
  extend(
    ...decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[]
  ): DecorationBuilderBuild {
    return this.decorate(true, ...decorators);
  }

  protected decoratorFactory(key: string, f: string = DefaultFlavour) {
    const contextDecorator = function contextDecorator(
      target: object,
      propertyKey?: any,
      descriptor?: TypedPropertyDescriptor<any>
    ) {
      const flavour = Decoration.flavourResolver(target);
      let decorators;
      const extras = Decoration.decorators[key][flavour].extras;
      if (
        Decoration.decorators[key] &&
        Decoration.decorators[key][flavour] &&
        Decoration.decorators[key][flavour].decorators
      ) {
        decorators = Decoration.decorators[key][flavour].decorators;
      } else {
        decorators = Decoration.decorators[key][DefaultFlavour].decorators;
      }
      [
        ...(decorators ? decorators.values() : []),
        ...(extras ? extras.values() : []),
      ].forEach((d) => (d as any)(target, propertyKey, descriptor, descriptor));
      // return apply(
      //
      // )(target, propertyKey, descriptor);
    };
    Object.defineProperty(contextDecorator, "name", {
      value: [f, key].join("_decorator_for_"),
      writable: false,
    });
    return contextDecorator;
  }

  /**
   * @description Creates the final decorator function
   * @summary Builds and returns the decorator factory function
   * @return {function(object, any?, TypedPropertyDescriptor?): any} The generated decorator function
   */
  apply(): (
    target: object,
    propertyKey?: any,
    descriptor?: TypedPropertyDescriptor<any>
  ) => any {
    if (!this.key)
      throw new Error("No key provided for the decoration builder");
    Decoration.register(this.key, this.flavour, this.decorators, this.extras);
    return this.decoratorFactory(this.key, this.flavour);
  }

  /**
   * @description Registers decorators for a specific key and flavour
   * @summary Internal method to store decorators in the static registry
   * @param {string} key Decorator key
   * @param {string} flavour Decorator flavour
   * @param {Set<ClassDecorator | PropertyDecorator | MethodDecorator>} [decorators] Primary decorators
   * @param {Set<ClassDecorator | PropertyDecorator | MethodDecorator>} [extras] Additional decorators
   */
  private static register(
    key: string,
    flavour: string,
    decorators?: Set<ClassDecorator | PropertyDecorator | MethodDecorator>,
    extras?: Set<ClassDecorator | PropertyDecorator | MethodDecorator>
  ) {
    if (!key) throw new Error("No key provided for the decoration builder");
    if (!decorators)
      throw new Error("No decorators provided for the decoration builder");
    if (!flavour)
      throw new Error("No flavour provided for the decoration builder");

    if (!Decoration.decorators[key]) Decoration.decorators[key] = {};
    if (!Decoration.decorators[key][flavour])
      Decoration.decorators[key][flavour] = {};
    if (decorators) Decoration.decorators[key][flavour].decorators = decorators;
    if (extras) Decoration.decorators[key][flavour].extras = extras;
  }

  /**
   * @description Sets the global flavour resolver
   * @summary Configures the function used to determine decorator flavours
   * @param {FlavourResolver} resolver Function to resolve flavours
   */
  static setFlavourResolver(resolver: FlavourResolver) {
    Decoration.flavourResolver = resolver;
  }

  static for(key: string): DecorationBuilderMid {
    return new Decoration().for(key);
  }

  static flavouredAs(flavour: string): DecorationBuilderStart {
    return new Decoration(flavour);
  }
}
