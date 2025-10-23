import { Model } from "../model/Model";
import { Constructor } from "@decaf-ts/decoration";
import { designTypeReturn, ExtendedMetadata } from "./types";
import { ValidationMetadata } from "../validation/index";

declare module "@decaf-ts/decoration" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Metadata {
    /**
     * @description Retrieves validation metadata for a specific property of a model
     * @summary Fetches validation rules and constraints that were applied to a property
     * via decorators. The optional key parameter allows drilling down to specific
     * validation types (e.g., 'required', 'min', 'max').
     *
     * @template M - The model type extending from Model
     * @param {Constructor<M>} model - The constructor of the target model class
     * @param {keyof M} property - The property name to retrieve validation for
     * @param {string} [key] - Optional specific validation key to retrieve (e.g., 'required', 'pattern')
     * @return {any} The validation metadata object or value at the specified key
     *
     * @example
     * class User extends Model {
     *   @required()
     *   @maxLength(100)
     *   name!: string;
     * }
     *
     * // Get all validation metadata for 'name'
     * const validations = Metadata.validationFor(User, 'name');
     *
     * // Get specific validation metadata
     * const required = Metadata.validationFor(User, 'name', 'required');
     */
    function validationFor<
      M extends Model,
      P extends keyof M = keyof M,
      K extends string = string,
    >(
      this: Metadata,
      model: Constructor<M>,
      property?: keyof M,
      key?: string
    ):
      | (K extends string
          ? ValidationMetadata
          : P extends keyof M
            ? Record<string, ValidationMetadata>
            : Record<keyof M, Record<string, ValidationMetadata>>)
      | undefined;

    /**
     * @description Retrieves all validatable for a model
     * @param model
     */
    function validatableProperties<M extends Model>(
      model: Constructor<M>,
      ...propsToIgnore: string[]
    ): string[];

    /**
     * @description Retrieves extended metadata for a model or a specific key within it
     * @summary When called with a constructor only, returns the entire metadata object
     * associated with the model, including validation rules, property types, relationships,
     * and other decorator-applied metadata. This override extends the base Metadata.get
     * method with type-safe support for ExtendedMetadata.
     *
     * @template M - The model type
     * @template META - The extended metadata type, defaults to ExtendedMetadata<M>
     * @param {Constructor<M>} model - The target constructor used to locate the metadata record
     * @param {keyof M} prop - Optional property of the model.
     * @return {META|undefined} The complete metadata object for the model, or undefined if no metadata exists
     *
     * @example
     * class Article extends Model {
     *   @pk()
     *   @type(Number)
     *   id!: number;
     *
     *   @required()
     *   @maxLength(200)
     *   title!: string;
     *
     *   @oneToMany(() => Comment, { update: true, delete: true }, true)
     *   comments!: Comment[];
     * }
     *
     * // Get all metadata for the Article model
     * const metadata = Metadata.get<Article>(Article);
     * // metadata contains:
     * // - property definitions
     * // - validation rules
     * // - relationship mappings
     * // - primary key information
     * // - column mappings
     *
     * @remarks
     * The @ts-expect-error directive is used because this declaration intentionally
     * overrides the signature from the base module to provide enhanced type information
     * specific to the decorator-validation system.
     */
    // @ts-expect-error override magic
    function get<M, META extends ExtendedMetadata<M> = ExtendedMetadata<M>>(
      model: Constructor<M>,
      prop?: keyof M
    ): META | undefined;

    /**
     * @description Retrieves the original constructor name for a model
     * @summary Fetches the original constructor name for a model from the metadata of a model.
     *
     * @template M - The model type extending from Model
     * @param {Constructor<M>} model - The constructor of the target model class
     * @return {string} The metadata object or value
     *
     * @example
     * class User extends Model {
     *
     * // Get the constructor name for 'User'
     * const constName = Metadata.modelName(User);
     */
    function modelName<M>(model: Constructor<M>): string;

    /**
     * @description Retrieves all allowed types for a model or a property
     * @summary Retrieves all allowed types for a model or a property from it's metadata.
     *
     * @template M - The model type extending from Model
     * @param {Constructor<M>} model - The constructor of the target model class
     * @param {keyof M} property - The property name to retrieve validation for
     * @return {any[]} An array of the allowed types
     *
     * @example
     * class User extends Model {
     *
     * // Get all validation metadata for 'User'
     * const allowedTypes = Metadata.meallowedTypestadata(User);
     */
    function allowedTypes<M>(model: Constructor<M>, property?: keyof M): any[];

    /**
     * @description Retrieves all allowed types for a model or a property
     * @summary Retrieves all allowed types for a model or a property from it's metadata.
     *
     * @template model - The model type extending from Model
     * @param {Constructor<M>} model - The constructor of the target model class
     * @param {keyof M} property - The property name to retrieve validation for
     * @return {designTypeReturn} An object of the designtypes
     *
     * @example
     * class User extends Model {
     *
     * // Get the designtypes for property name
     * const validationMetaData = Metadata.get(User.constructor, 'name')
     * const allowedTypes = Metadata.getPropDesignTypes(User.constructor, 'name', validationMetaData?.validation);
     */
    function getPropDesignTypes<M>(
      model: Constructor<M>,
      property: keyof M,
      validation?: ValidationMetadata
    ): designTypeReturn;

    // /**
    //  * @description Saves metadata under a key for a specific operation
    //  * @summary Saves metadata under a key for a specific operation
    //  *
    //  * @template M - The model type extending from Model
    //  * @param {Constructor<M>} model - The constructor of the target model class
    //  * @param {keyof M} propertyKey - The property key to store metadata for
    //  * @param {string} operation - The type of operation being done. Eg. on.update
    //  * @param {any} metadata - The metadata to store to for the operation
    //  * @return {void}
    //  *
    //  * @example
    //  * class User extends Model {
    //  *
    //  * // Set metatada for 'User' for key updatedOn, for operation on.create
    //  * Metadata.saveOperation(User.constructor,'updatedOn','on.create',metadata);
    //  */
    // function saveOperation<M>(
    //   model: Constructor<M>,
    //   propertyKey: keyof M,
    //   operation: string,
    //   metadata: any
    // ): void;

    // /**
    //  * @description Reads the metadata under a key for a specific operation
    //  * @summary Reads the metadata under a key for a specific operation
    //  *
    //  * @template M - The model type extending from Model
    //  * @param {Constructor<M>} model - The constructor of the target model class
    //  * @param {keyof M} propertyKey - The property key to store metadata for
    //  * @param {string} operation - The type of operation being done. Eg. on.update
    //  * @return {any} metadata - The metadata to store to for the operation
    //  *
    //  * @example
    //  * class User extends Model {
    //  *
    //  * // Get metatada for 'User' for key updatedOn, for operation on.create
    //  * const metadata = Metadata.readOperation(User.constructor,'updatedOn','on.create');
    //  */
    // function readOperation<M>(
    //   model: Constructor<M>,
    //   propertyKey: keyof M,
    //   operation: string
    // ): any;
  }
}
