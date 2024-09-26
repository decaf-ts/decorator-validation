import { ModelErrorDefinition } from "./ModelErrorDefinition";
import { DecoratorMetadata, getPropertyDecorators } from "@decaf-ts/reflection";
import { ModelKeys } from "../utils/constants";
import { sf } from "../utils/strings";
import { ReservedModels } from "./constants";
import { Validatable } from "./types";
import { Model } from "./Model";
import { Validation } from "../validation/Validation";
import {
  DEFAULT_ERROR_MESSAGES,
  ValidationKeys,
} from "../validation/Validators/constants";
import {
  ModelErrors,
  ValidationPropertyDecoratorDefinition,
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
    if (obj.hasOwnProperty(prop) && propsToIgnore.indexOf(prop) === -1)
      decoratedProperties.push(
        getPropertyDecorators(
          ValidationKeys.REFLECT,
          obj,
          prop,
        ) as ValidationPropertyDecoratorDefinition,
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
          (t) => t === defaultTypeDecorator.props.name,
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
      const err: string | undefined = validator.hasErrors(
        (obj as any)[prop.toString()],
        ...(decorator.key === ModelKeys.TYPE
          ? [decorator.props]
          : Object.values(decorator.props)),
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
    let errs: Record<string, string | undefined> | undefined = undefined;

    // if a nested Model
    const allDecorators = getPropertyDecorators(
      ValidationKeys.REFLECT,
      obj,
      prop,
    ).decorators;
    const decorators = getPropertyDecorators(
      ValidationKeys.REFLECT,
      obj,
      prop,
    ).decorators.filter(
      (d) => [ModelKeys.TYPE, ValidationKeys.TYPE].indexOf(d.key) !== -1,
    );
    if (!decorators || !decorators.length) continue;
    const dec = decorators.pop() as DecoratorMetadata;
    const clazz = dec.props.name
      ? [dec.props.name]
      : Array.isArray(dec.props.customTypes)
        ? dec.props.customTypes
        : [dec.props.customTypes];
    const reserved = Object.values(ReservedModels).map((v) =>
      v.toLowerCase(),
    ) as string[];

    for (const c of clazz) {
      if (reserved.indexOf(c.toLowerCase()) === -1) {
        const typeDecoratorKey = Array.isArray((obj as any)[prop])
          ? ValidationKeys.LIST
          : ValidationKeys.TYPE;
        const types: any =
          allDecorators.find((d) => d.key === typeDecoratorKey) || {};
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

        const validate = (
          prop: string,
          idx: number,
          value: any,
        ): string | undefined => {
          const atIndex = idx >= 0 ? `at index ${idx} ` : "";
          if (typeof value === "object" || typeof value === "function")
            return !!value.hasErrors
              ? value.hasErrors()
              : `Value in prop ${prop} ${atIndex}is not validatable`;
          return allowedTypes.includes(typeof value)
            ? undefined
            : `Value in prop ${prop} ${atIndex}has no valid type`;
        };

        switch (c) {
          case Array.name:
          case Set.name:
            if (allDecorators.length) {
              const listDec = allDecorators.find(
                (d) => d.key === ValidationKeys.LIST,
              );
              if (listDec) {
                const e =
                  c ===
                  (Array.name
                    ? (obj as Record<string, any>)[prop]
                    : (obj as Record<string, any>)[prop].values()
                  ).find((v: Validatable, idx: number) =>
                    validate(prop, idx, v),
                  );
                if (e)
                  err = sf(DEFAULT_ERROR_MESSAGES.LIST_INSIDE, e.toString());
              }
            }
            break;
          default:
            try {
              if ((obj as Record<string, any>)[prop])
                err = validate(prop, -1, (obj as any)[prop]);
            } catch (e: any) {
              console.warn(sf("Model should be validatable but its not"));
            }
        }

        if (err) {
          errs = errs || {};
          errs[prop] = err;
        }
      }
    }

    if (errs) {
      result = result || {};
      result[prop] = errs;
    }
  }

  return result ? new ModelErrorDefinition(result) : undefined;
}
