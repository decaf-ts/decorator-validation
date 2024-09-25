import { ModelErrorDefinition } from "./ModelErrorDefinition";
import {
  DEFAULT_ERROR_MESSAGES,
  ModelErrors,
  Validation,
  ValidationDecoratorDefinition,
  ValidationKeys,
  ValidationPropertyDecoratorDefinition,
} from "../validation";
import { DecoratorMetadata, getPropertyDecorators } from "@decaf-ts/reflection";
import { ModelKeys } from "../utils/constants";
import { sf } from "../utils/strings";
import { ReservedModels } from "./constants";
import { Validatable } from "./types";
import { Model } from "./Model";

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

  const result = decoratedProperties.reduce(
    (
      accum: undefined | ModelErrors,
      decoratedProperty: ValidationPropertyDecoratorDefinition,
    ) => {
      const { prop, decorators } = decoratedProperty;

      if (!decorators || !decorators.length) return accum;

      const defaultTypeDecorator: ValidationDecoratorDefinition = decorators[0];

      // tries to find any type decorators or other decorators that already enforce type (the ones with the allowed types property defined). if so, skip the default type verification
      if (
        decorators.find((d: ValidationDecoratorDefinition) => {
          if (d.key === ValidationKeys.TYPE) return true;
          if (
            d.props.types?.find(
              (t: string) => t === defaultTypeDecorator.props.name,
            )
          )
            return true;
          return false;
        })
      )
        decorators.shift(); // remove the design:type decorator, since the type will already be checked

      let errs: { [indexer: string]: string | undefined } | undefined =
        decorators.reduce(
          (
            acc: undefined | { [indexer: string]: string | undefined },
            decorator: { key: string; props: object },
          ) => {
            const validator = Validation.get(decorator.key);
            if (!validator) {
              return acc;
            }

            const err: string | undefined = validator.hasErrors(
              obj[prop.toString()],
              ...(decorator.key === ModelKeys.TYPE
                ? [decorator.props]
                : Object.values(decorator.props)),
            );

            if (err) {
              acc = acc || {};
              acc[decorator.key] = err;
            }

            return acc;
          },
          undefined,
        );

      errs =
        errs ||
        Object.keys(obj)
          .filter((k) => !errs || !errs[k])
          .reduce((acc: Record<string, any> | undefined, prop) => {
            let err: string | undefined;
            // if a nested Model
            const allDecorators = getPropertyDecorators(
              ValidationKeys.REFLECT,
              obj,
              prop,
            ).decorators;
            const decorators = allDecorators.filter(
              (d) =>
                [ModelKeys.TYPE, ValidationKeys.TYPE].indexOf(d.key) !== -1,
            );
            if (!decorators || !decorators.length) return acc;
            const dec = decorators.pop() as DecoratorMetadata;
            const clazz = dec.props.name
              ? [dec.props.name]
              : Array.isArray(dec.props.customTypes)
                ? dec.props.customTypes
                : [dec.props.customTypes];
            const reserved = Object.values(ReservedModels).map((v) =>
              v.toLowerCase(),
            ) as string[];

            clazz.forEach((c: string) => {
              if (reserved.indexOf(c.toLowerCase()) === -1) {
                switch (c) {
                  case "Array":
                  case "Set":
                    if (allDecorators.length) {
                      const listDec = allDecorators.find(
                        (d) => d.key === ValidationKeys.LIST,
                      );
                      if (listDec) {
                        const e =
                          c === "Array"
                            ? (obj as Record<string, any>)[prop].find(
                                (c: Validatable) => c.hasErrors(),
                              )
                            : (obj as Record<string, any>)[prop]
                                .values()
                                .find((c: Validatable) => c.hasErrors());
                        if (e)
                          err = sf(
                            DEFAULT_ERROR_MESSAGES.LIST_INSIDE,
                            e.toString(),
                          );
                      }
                    }
                    break;
                  default:
                    try {
                      if ((obj as Record<string, any>)[prop])
                        err = (obj as Record<string, any>)[prop].hasErrors();
                    } catch (e: any) {
                      console.warn(
                        sf("Model should be validatable but its not"),
                      );
                    }
                }
              }
            });

            if (err) {
              acc = acc || {};
              acc[prop] = err;
            }
            return acc;
          }, undefined);

      if (errs) {
        accum = accum || {};
        accum[decoratedProperty.prop.toString()] = errs;
      }

      return accum;
    },
    undefined,
  );
  return result ? new ModelErrorDefinition(result) : undefined;
}
