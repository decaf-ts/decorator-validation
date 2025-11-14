import { DecorationKeys } from "@decaf-ts/decoration";
/**
 * @description Enum containing metadata keys used for reflection in the model system
 * @summary Defines the various Model keys used for reflection and metadata storage.
 * These keys are used throughout the library to store and retrieve metadata about models,
 * their properties, and their behavior.
 *
 * @property {string} TYPE - Key for storing design type information
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
  DESCRIPTION = `${DecorationKeys.DESCRIPTION}`,
  TYPE = `${DecorationKeys.DESIGN_TYPE}`,
  MODEL = "model",
  ANCHOR = "__model",
  CONSTRUCTION = "constructed-by",
  ATTRIBUTE = "__attributes",
  HASHING = "hashing",
  SERIALIZATION = "serialization",
  CONSTRUCTOR = `${DecorationKeys.CONSTRUCTOR}`,
}
