/**
 * @module decorator-validation
 * @description TypeScript decorator-based validation library
 * @summary This module provides a comprehensive validation framework using TypeScript decorators.
 * It exposes utility functions, validation decorators, and model-related functionality for
 * implementing type-safe, declarative validation in TypeScript applications.
 */
import { Metadata } from "@decaf-ts/decoration";

export * from "./constants";
export * from "./types";
export * from "./utils";
export * from "./validation";
export * from "./model";

/**
 * @description Current version of the reflection package
 * @summary Stores the semantic version number of the package
 * @const VERSION
 * @memberOf module:decorator-validation
 */
export const VERSION = "##VERSION##";

/**
 * @description Current version of the reflection package
 * @summary Stores the semantic version number of the package
 * @const PACKAGE_NAME
 * @memberOf module:decorator-validation
 */
export const PACKAGE_NAME = "##PACKAGE##";

Metadata.registerLibrary(PACKAGE_NAME, VERSION);
