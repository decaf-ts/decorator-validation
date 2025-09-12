/**
 * @description Enum containing metadata keys used for reflection in the model system
 * @summary Defines the various Model keys used for reflection and metadata storage.
 * These keys are used throughout the library to store and retrieve metadata about models,
 * their properties, and their behavior.
 *
 * @property {string} REFLECT - Prefix to all other keys, used as a namespace
 * @property {string} TYPE - Key for storing design type information
 * @property {string} PARAMS - Key for storing method parameter types
 * @property {string} RETURN - Key for storing method return type
 * @property {string} MODEL - Key for identifying model metadata
 * @property {string} ANCHOR - Anchor key that serves as a ghost property in the model
 * @property {string} CONSTRUCTION - Key for storing construction information
 * @property {string} ATTRIBUTE - Key for storing attribute metadata
 * @property {string} HASHING - Key for storing hashing configuration
 * @property {string} SERIALIZATION - Key for storing serialization configuration
 *
 * @enum {string}
 * @readonly
 * @memberOf module:decorator-validation
 * @category Model
 */
export enum ModelKeys {
  REFLECT = "decaf.model.",
  DESCRIPTION = "decaf.description.",
  TYPE = "design:type",
  PARAMS = "design:paramtypes",
  RETURN = "design:returntype",
  MODEL = "model",
  ANCHOR = "__model",
  CONSTRUCTION = "constructed-by",
  ATTRIBUTE = "__attributes",
  HASHING = "hashing",
  SERIALIZATION = "serialization",
}

/**
 * @description Default flavour identifier for the decorator system
 * @summary Defines the default flavour used by the Decoration class when no specific flavour is provided.
 * This constant is used throughout the library as the fallback flavour for decorators.
 *
 * @const {string}
 * @memberOf module:decorator-validation
 * @category Model
 */
export const DefaultFlavour = "decaf";
