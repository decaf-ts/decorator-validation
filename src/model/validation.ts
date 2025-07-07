import { ModelErrorDefinition } from "./ModelErrorDefinition";
import { DecoratorMetadata, Reflection } from "@decaf-ts/reflection";
import { ModelKeys } from "../utils/constants";
import { Model } from "./Model";
import { Validation } from "../validation/Validation";
import { ValidationKeys } from "../validation/Validators/constants";
import { ModelErrors, ValidationDecoratorDefinition, ValidatorOptions } from "../validation/types";
import { PathProxyEngine } from "../utils/PathProxy";
import { ReservedModels } from "./constants";
import { VALIDATION_PARENT_KEY } from "../constants";
import { Validatable } from "./types";

export type ValidationDecoratorDefinitionAsync = ValidationDecoratorDefinition & { async: boolean };

export type ValidationPropertyDecoratorDefinitionAsync = {
  prop: string | symbol;
  decorators: ValidationDecoratorDefinitionAsync[];
};

export type DecoratorMetadataAsync = DecoratorMetadata & { async: boolean };

export function validateNestedProps<M extends Model>(
  obj: M,
  props: string[]
): ModelErrors | undefined {
  let errs: ModelErrors | undefined = undefined;

  for (const prop of props) {
    let err: string | undefined;
    const allDecorators = Reflection.getPropertyDecorators(
      ValidationKeys.REFLECT,
      obj,
      prop
    ).decorators;

    const decorators = [...allDecorators].filter(
      (d: { key: string }) => [ModelKeys.TYPE, ValidationKeys.TYPE as string].indexOf(d.key) !== -1
    );

    if (!decorators || !decorators.length) continue;

    const dec = decorators.pop() as DecoratorMetadata;
    const clazz = dec.props.name
      ? [dec.props.name]
      : Array.isArray(dec.props.customTypes)
        ? dec.props.customTypes
        : [dec.props.customTypes];

    const reserved = Object.values(ReservedModels).map((v) => v.toLowerCase()) as string[];

    for (const c of clazz) {
      if (!(reserved.indexOf(c.toLowerCase()) === -1)) continue;

      const typeDecoratorKey = Array.isArray((obj as any)[prop])
        ? ValidationKeys.LIST
        : ValidationKeys.TYPE;

      const types: any =
        allDecorators.find((d: { key: string }) => d.key === typeDecoratorKey) || {};

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
        if (typeof value !== "object" && typeof value !== "function") return undefined;

        try {
          if (value && !value[VALIDATION_PARENT_KEY]) value[VALIDATION_PARENT_KEY] = obj;

          return Model.isModel(value)
            ? value.hasErrors()
            : allowedTypes.includes(typeof value)
              ? undefined
              : "Value has no validatable type";
        } finally {
          if (value && value[VALIDATION_PARENT_KEY]) delete value[VALIDATION_PARENT_KEY];
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
                .map((v: Validatable<true | false>) => validate(prop, v))
                .filter((e: any) => !!e) as any;

              if (!err?.length) {
                err = undefined;
              }
            }
          }
          break;
        default:
          try {
            if ((obj as Record<string, any>)[prop]) err = validate(prop, (obj as any)[prop]);
          } catch (e: unknown) {
            console.warn(`Model should be validatable but its not: ${e}`);
          }
      }

      if (err) {
        errs = errs || {};
        errs[prop] = err as any;
      }
    }
  }

  return errs;
}

export function getValidatableProperties(
  obj: any,
  propsToIgnore: string[]
): ValidationPropertyDecoratorDefinitionAsync[] {
  const decoratedProperties: ValidationPropertyDecoratorDefinitionAsync[] = [];

  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop) && !propsToIgnore.includes(prop)) {
      decoratedProperties.push(
        Reflection.getPropertyDecorators(
          ValidationKeys.REFLECT,
          obj,
          prop
        ) as unknown as ValidationPropertyDecoratorDefinitionAsync
      );
    }
  }

  return decoratedProperties;
}

export function validateDecorators<IsAsync extends boolean = false>(
  obj: any,
  prop: string | symbol,
  decorators: DecoratorMetadataAsync[],
  async?: IsAsync
): Record<string, string | undefined> | undefined {
  let errs: Record<string, string | undefined> | undefined = undefined;

  for (const decorator of decorators) {
    const validator = Validation.get(decorator.key);
    if (!validator) {
      throw new Error(`Missing validator for ${decorator.key}`);
    }

    const decoratorProps =
      decorator.key === ModelKeys.TYPE ? [decorator.props] : decorator.props || {};

    const err: string | undefined = validator.hasErrors(
      (obj as any)[prop.toString()],
      decoratorProps as ValidatorOptions,
      PathProxyEngine.create(obj, { ignoreUndefined: true, ignoreNull: true })
    );

    if (err) {
      errs = errs || {};
      errs[decorator.key] = err;
    }
  }

  return errs;
}

export function validate<M extends Model>(
  obj: M,
  ...propsToIgnore: string[]
): ModelErrorDefinition | undefined {
  const decoratedProperties: ValidationPropertyDecoratorDefinitionAsync[] =
    getValidatableProperties(obj, propsToIgnore);

  let result: ModelErrors | undefined = undefined;

  for (const decoratedProperty of decoratedProperties) {
    const { prop, decorators } = decoratedProperty as ValidationPropertyDecoratorDefinitionAsync;

    if (!decorators || !decorators.length) continue;

    const defaultTypeDecorator: DecoratorMetadata = decorators[0];

    // tries to find any type decorators or other decorators that already enforce type (the ones with the allowed types property defined). if so, skip the default type verification
    if (
      decorators.find((d) => {
        if (d.key === ValidationKeys.TYPE) return true;
        return !!d.props.types?.find((t) => t === defaultTypeDecorator.props.name);
      })
    ) {
      decorators.shift(); // remove the design:type decorator, since the type will already be checked
    }

    const errs: Record<string, string | undefined> | undefined = validateDecorators(
      obj,
      prop,
      decorators
    );

    if (errs) {
      result = result || {};
      result[decoratedProperty.prop.toString()] = errs;
    }
  }

  const hasErrors = (errs?: ModelErrors) => errs && Object.keys(errs).length > 0;
  const mergedErrors = {
    ...result,
    ...validateNestedProps(
      obj,
      Object.keys(obj).filter((prop) => !result?.[prop])
    ),
  };

  return hasErrors(mergedErrors) ? new ModelErrorDefinition(mergedErrors) : undefined;
}
