import { ModelErrorDefinition } from "./ModelErrorDefinition";
import { DecoratorMetadata, Reflection } from "@decaf-ts/reflection";
import { ModelKeys } from "../utils/constants";
import { sf } from "../utils/strings";
import { ReservedModels } from "./constants";
import { VALIDATION_PARENT_KEY } from "../constants";
import { Validatable } from "./types";
import { isModel, Model } from "./Model";
import { Validation } from "../validation/Validation";
import { ValidationKeys } from "../validation/Validators/constants";
import {
  ModelErrors,
  ValidationPropertyDecoratorDefinition,
  ValidatorOptions,
} from "../validation/types";

/**
 * @summary Analyses the decorations of the properties and validates the obj according to them
 *
 * @typedef T extends Model
 * @prop {T} obj Model object to validate
 * @prop {string[]} [propsToIgnore] object properties to ignore in the validation
 *
 * @function validate
 * @memberOf module:decorator-validation.Validation
 * @category Validation
 */
export function validate<T extends Model>(
  obj: T,
  ...propsToIgnore: string[]
): ModelErrorDefinition | undefined {
  const decoratedProperties: ValidationPropertyDecoratorDefinition[] = [];
  for (const prop in obj)
    if (
      Object.prototype.hasOwnProperty.call(obj, prop) &&
      propsToIgnore.indexOf(prop) === -1
    )
      decoratedProperties.push(
        Reflection.getPropertyDecorators(
          ValidationKeys.REFLECT,
          obj,
          prop
        ) as ValidationPropertyDecoratorDefinition
      );

  let result: ModelErrors | undefined = undefined;

  for (const decoratedProperty of decoratedProperties) {
    const { prop, decorators } = decoratedProperty;

    if (!decorators || !decorators.length) continue;

    const defaultTypeDecorator: DecoratorMetadata = decorators[0];

    // tries to find any type decorators or other decorators that already enforce type (the ones with the allowed types property defined). if so, skip the default type verification
    if (
      decorators.find((d) => {
        if (d.key === ValidationKeys.TYPE) return true;
        return !!d.props.types?.find(
          (t) => t === defaultTypeDecorator.props.name
        );
      })
    ) {
      decorators.shift(); // remove the design:type decorator, since the type will already be checked
    }

    let errs: Record<string, string | undefined> | undefined = undefined;

    for (const decorator of decorators) {
      const validator = Validation.get(decorator.key);
      if (!validator) {
        throw new Error(`Missing validator for ${decorator.key}`);
      }

      const decoratorProps =
        decorator.key === ModelKeys.TYPE
          ? [decorator.props]
          : decorator.props || {};

      const err: string | undefined = validator.hasErrors(
        (obj as any)[prop.toString()],
        decoratorProps as ValidatorOptions,
        obj // TODO: Assert type and deep Object.freeze
      );

      if (err) {
        errs = errs || {};
        errs[decorator.key] = err;
      }
    }

    if (errs) {
      result = result || {};
      result[decoratedProperty.prop.toString()] = errs;
    }
  }

  // tests nested classes
  for (const prop of Object.keys(obj).filter((k) => !result || !result[k])) {
    let err: string | undefined;
    // if a nested Model
    const allDecorators = Reflection.getPropertyDecorators(
      ValidationKeys.REFLECT,
      obj,
      prop
    ).decorators;
    const decorators = Reflection.getPropertyDecorators(
      ValidationKeys.REFLECT,
      obj,
      prop
    ).decorators.filter(
      (d: { key: string }) =>
        [ModelKeys.TYPE, ValidationKeys.TYPE as string].indexOf(d.key) !== -1
    );
    if (!decorators || !decorators.length) continue;
    const dec = decorators.pop() as DecoratorMetadata;
    const clazz = dec.props.name
      ? [dec.props.name]
      : Array.isArray(dec.props.customTypes)
        ? dec.props.customTypes
        : [dec.props.customTypes];
    const reserved = Object.values(ReservedModels).map((v) =>
      v.toLowerCase()
    ) as string[];

    for (const c of clazz) {
      if (reserved.indexOf(c.toLowerCase()) === -1) {
        const typeDecoratorKey = Array.isArray((obj as any)[prop])
          ? ValidationKeys.LIST
          : ValidationKeys.TYPE;
        const types: any =
          allDecorators.find(
            (d: { key: string }) => d.key === typeDecoratorKey
          ) || {};
        let allowedTypes: string[] = [];
        if (types && types.props) {
          const customTypes = Array.isArray((obj as any)[prop])
            ? types.props.class
            : types.props.customTypes;
          if (customTypes)
            allowedTypes = Array.isArray(customTypes)
              ? customTypes.map((t) => `${t}`.toLowerCase())
              : [customTypes.toLowerCase()];
        }

        const validate = (prop: string, value: any): any => {
          if (typeof value !== "object" && typeof value !== "function")
            return undefined;

          try {
            if (value && !value[VALIDATION_PARENT_KEY])
              value[VALIDATION_PARENT_KEY] = obj; // TODO: freeze?

            return isModel(value)
              ? value.hasErrors()
              : allowedTypes.includes(typeof value)
                ? undefined
                : "Value has no validatable type";
          } finally {
            if (value && value[VALIDATION_PARENT_KEY])
              delete value[VALIDATION_PARENT_KEY];
          }
        };

        switch (c) {
          case Array.name:
          case Set.name:
            if (allDecorators.length) {
              const listDec = allDecorators.find(
                (d: { key: string }) => d.key === ValidationKeys.LIST
              );
              if (listDec) {
                err = (
                  c === Array.name
                    ? (obj as Record<string, any>)[prop]
                    : // If it's a Set
                      (obj as Record<string, any>)[prop].values()
                )
                  .map((v: Validatable) => validate(prop, v))
                  .filter((e: any) => !!e) as any;
                if (!err?.length) {
                  // if the result is an empty list...
                  err = undefined;
                }
              }
            }
            break;
          default:
            try {
              if ((obj as Record<string, any>)[prop])
                err = validate(prop, (obj as any)[prop]);
            } catch (e: any) {
              console.warn(sf("Model should be validatable but its not: " + e));
            }
        }
      }
      if (err) {
        result = result || {};
        result[prop] = err as any;
      }
    }
  }

  return result ? new ModelErrorDefinition(result) : undefined;
}
