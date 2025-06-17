import { COMPARISON_ERROR_MESSAGES, VALIDATION_PARENT_KEY } from "../constants";
import { sf } from "./strings";

const fallbackGetParent = (target: any) => {
  return target[VALIDATION_PARENT_KEY];
};

const fallbackGetValue = (target: any, prop: string) => {
  if (!Object.prototype.hasOwnProperty.call(target, prop))
    throw new Error(sf(COMPARISON_ERROR_MESSAGES.PROPERTY_NOT_EXIST, prop));
  return target[prop];
};

/**
 * Proxy object that provides path-based access to nested properties
 * @template T - The type of the target object being proxied
 */
export type PathProxy<T> = T & {
  // [PROXY_PROP]: boolean;
  getValueFromPath: (path: string, fallback?: any) => any;
};

/**
 * Standard path resolution utility for accessing nested object properties.
 * Provides consistent dot-notation access to both parent and child properties
 * across complex object structures.
 *
 * - Dot-notation path resolution ('object.child.property')
 * - Parent traversal using '../' notation
 * - Configurable property access behavior
 * - Null/undefined safety checks
 */
export class PathProxyEngine {
  /**
   * Creates a path-aware proxy for the target object
   * @template T - The type of the target object
   * @param {T} rootTarget - The target object to proxy
   * @param opts - Configuration options
   * @param opts.getValue - Custom function to get property value
   * @param opts.getParent - Custom function to get parent object
   * @param opts.ignoreUndefined - Whether to ignore undefined values in paths
   * @param opts.ignoreNull - Whether to ignore null values in paths
   * @returns A proxy object with path access capabilities
   */
  static create<T extends object>(
    rootTarget: T,
    opts?: {
      getValue?: (target: T, prop: string) => any;
      getParent?: (target: T) => any;
      ignoreUndefined: boolean;
      ignoreNull: boolean;
    }
  ): PathProxy<T> {
    const { getValue, getParent, ignoreUndefined, ignoreNull } = {
      getParent: fallbackGetParent,
      getValue: fallbackGetValue,
      ignoreNull: false,
      ignoreUndefined: false,
      ...opts,
    };

    const proxy = new Proxy({} as any, {
      get(target, prop) {
        if (prop === "getValueFromPath") {
          return function (path: string): any {
            const parts = PathProxyEngine.parsePath(path);
            let current: any = rootTarget;

            for (let i = 0; i < parts.length; i++) {
              const part = parts[i];
              if (part === "..") {
                const parent = getParent(current);
                if (!parent || typeof parent !== "object") {
                  throw new Error(
                    sf(
                      COMPARISON_ERROR_MESSAGES.CONTEXT_NOT_OBJECT_COMPARISON,
                      i + 1,
                      path
                    )
                  );
                }
                current = parent; //PathProxyEngine.create(parentTarget, opts);
                continue;
              }

              current = getValue(current, part);
              if (!ignoreUndefined && typeof current === "undefined")
                throw new Error(
                  sf(COMPARISON_ERROR_MESSAGES.PROPERTY_INVALID, path, part)
                );

              if (!ignoreNull && current === null)
                throw new Error(
                  sf(COMPARISON_ERROR_MESSAGES.PROPERTY_INVALID, path, part)
                );
            }

            return current;
          };
        }

        return target[prop];
      },
    });

    // Object.defineProperty(proxy, PROXY_PROP, {
    //   value: true, // overwrite by proxy behavior
    //   enumerable: false,
    //   configurable: false,
    //   writable: false,
    // });

    return proxy as PathProxy<T>;
  }

  /**
   * Parses a path string into individual components
   * @param path - The path string to parse (e.g., "user.address.city")
   * @returns An array of path components
   * @throws Error if the path is invalid
   */
  private static parsePath(path: string): string[] {
    if (typeof path !== "string" || !path.trim())
      throw new Error(sf(COMPARISON_ERROR_MESSAGES.INVALID_PATH, path));
    return path.match(/(\.\.|[^\/.]+)/g) || [];
  }
}
