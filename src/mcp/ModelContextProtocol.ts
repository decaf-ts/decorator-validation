import { FastMCP, Tool } from "fastmcp";
import { Logger, Logging } from "@decaf-ts/logging";
import { FastMCPSessionAuth } from "./types";

/**
 * @description Validates and normalizes a semantic version string.
 * @summary Ensures the provided version follows semantic versioning (major.minor.patch) and returns a tuple-like template string typed as `${number}.${number}.${number}`.
 * @template
 * @param {string} version The version string to validate, expected in the form MAJOR.MINOR.PATCH.
 * @return {string} The normalized version string if valid.
 * @function validateVersion
 * @memberOf module:decorator-validation
 */
function validateVersion(version: string): `${number}.${number}.${number}` {
  const regexp = /(\d+)\.(\d+)\.(\d+)/g;
  const match = regexp.exec(version);
  if (!match)
    throw new Error(
      `Invalid version string. should obey semantic versioning: ${version}`
    );
  return `${match[1]}.${match[2]}.${match[3]}` as `${number}.${number}.${number}`;
}

/**
 * @description Fluent builder for creating a configured ModelContextProtocol instance.
 * @summary Collects MCP configuration including a semantic version, a name, and a registry of tools, offering chainable methods and a final build step to produce a ready-to-use ModelContextProtocol.
 * @param {string} [name] The name of the MCP instance to build.
 * @param {string} [version] The semantic version of the MCP instance.
 * @param {Record<string, Tool<any, any>>} [tools] A map of tool configurations indexed by tool name.
 * @class
 * @example
 * // Build a new MCP with a single tool
 * const mcp = ModelContextProtocol.builder
 *   .setName("Example")
 *   .setVersion("1.0.0")
 *   .addTool({ name: "do", description: "", parameters: z.any(), execute: async () => "ok" })
 *   .build();
 * @mermaid
 * sequenceDiagram
 *   participant Dev as Developer
 *   participant B as Builder
 *   participant MCP as ModelContextProtocol
 *   Dev->>B: setName("Example")
 *   B-->>Dev: Builder
 *   Dev->>B: setVersion("1.0.0")
 *   B-->>Dev: Builder
 *   Dev->>B: addTool(tool)
 *   B-->>Dev: Builder
 *   Dev->>B: build()
 *   B->>MCP: new ModelContextProtocol(FastMCP)
 *   B-->>Dev: ModelContextProtocol
 */
class Builder {
  name!: string;
  version!: `${number}.${number}.${number}`;
  tools: Record<string, Tool<any, any>> = {};

  log = Logging.for("MCP Builder");

  constructor() {}

  /**
   * @description Sets the MCP instance name.
   * @summary Assigns a human-readable identifier to the builder configuration and enables method chaining.
   * @param {string} value The name to assign to the MCP instance.
   * @return {this} The current builder instance for chaining.
   */
  setName(value: string) {
    this.name = value;
    this.log.debug(`name set to ${value}`);
    return this;
  }

  /**
   * @description Sets and validates the semantic version for the MCP instance.
   * @summary Parses the provided value against semantic versioning and stores the normalized version; enables method chaining.
   * @param {string} value The semantic version string (e.g., "1.2.3").
   * @return {this} The current builder instance for chaining.
   */
  setVersion(value: string) {
    this.version = validateVersion(value);
    this.log.debug(`version set to ${value}`);
    return this;
  }

  /**
   * @description Registers a new tool in the builder.
   * @summary Adds a tool configuration by its unique name to the internal registry, throwing if a tool with the same name already exists.
   * @template Auth extends FastMCPSessionAuth
   * @param {Tool<Auth, any>} config The tool configuration object, including a unique name and an execute handler.
   * @return {this} The current builder instance for chaining.
   */
  addTool<Auth extends FastMCPSessionAuth = undefined>(
    config: Tool<Auth, any>
  ) {
    const { name } = config;
    if (name in this.tools) throw new Error(`tool ${name} already registered`);
    this.tools[name] = config;
    this.log.debug(`tool ${name} added`);
    return this;
  }

  /**
   * @description Finalizes the configuration and produces a ModelContextProtocol instance.
   * @summary Validates required fields (name and version), constructs a FastMCP instance, registers all configured tools, and returns a ModelContextProtocol wrapping the MCP.
   * @template Auth extends FastMCPSessionAuth
   * @return {ModelContextProtocol<Auth>} A fully initialized ModelContextProtocol instance.
   */
  build<
    Auth extends FastMCPSessionAuth = undefined,
  >(): ModelContextProtocol<Auth> {
    if (!this.name) throw new Error("name is required");
    if (!this.version) throw new Error("version is required");
    const mcp = new FastMCP<Auth>({
      name: this.name,
      version: this.version,
    });
    Object.values(this.tools).forEach((tool) => {
      try {
        mcp.addTool(tool);
      } catch (e: unknown) {
        throw new Error(`Failed to add tool ${tool.name}: ${e}`);
      }
    });
    this.log.info(`${this.name} MCP built`);
    this.log.debug(
      `${this.name} MCP - available tools: ${Object.keys(this.tools).join(", ")}`
    );
    return new ModelContextProtocol(mcp);
  }
}

/**
 * @description A thin wrapper around FastMCP providing a typed interface for model-centric protocols.
 * @summary Encapsulates a configured FastMCP instance and exposes factory utilities via a static Builder for constructing MCPs with tools, versioning, and naming semantics.
 * @template Auth extends FastMCPSessionAuth Authentication payload type stored in the MCP session, or undefined for no auth.
 * @param {FastMCP<Auth>} mcp The underlying FastMCP instance used to register and run tools.
 * @class
 * @example
 * // Using the builder
 * const protocol = ModelContextProtocol.builder
 *   .setName("Validator")
 *   .setVersion("1.2.3")
 *   .addTool({ name: "ping", description: "", parameters: z.any(), execute: async () => "pong" })
 *   .build();
 * @mermaid
 * sequenceDiagram
 *   participant Dev as Developer
 *   participant B as ModelContextProtocol.Builder
 *   participant MCP as FastMCP
 *   participant Proto as ModelContextProtocol
 *   Dev->>B: setName()/setVersion()/addTool()
 *   Dev->>B: build()
 *   B->>MCP: new FastMCP({ name, version })
 *   B->>MCP: addTool(tool...)
 *   B->>Proto: new ModelContextProtocol(MCP)
 *   B-->>Dev: ModelContextProtocol
 */
export class ModelContextProtocol<Auth extends FastMCPSessionAuth = undefined> {
  /**
   * @description Lazily obtains a logger instance for this protocol wrapper.
   * @summary Uses the Logging facility to create a context-aware Logger bound to this instance.
   * @return {Logger} A logger instance for this class.
   */
  protected get log(): Logger {
    return Logging.for(this as any);
  }

  constructor(protected readonly mcp: FastMCP<Auth>) {}

  /**
   * @description Alias to the inner Builder class for external access.
   * @summary Exposes the builder type to consumers to enable typed construction of ModelContextProtocol instances.
   */
  static readonly Builder = Builder;

  /**
   * @description Factory accessor for a new Builder instance.
   * @summary Creates a new builder to fluently configure and construct a ModelContextProtocol.
   * @return {Builder} A new builder instance.
   */
  static get builder() {
    return new ModelContextProtocol.Builder();
  }

  /**
   * @description Validates a semantic version string.
   * @summary Utility wrapper around the module-level validateVersion to keep a typed validator close to the class API.
   * @param {string} version The version string to validate.
   * @return {string} The normalized semantic version string.
   */
  private static validateVersion(
    version: string
  ): `${number}.${number}.${number}` {
    return validateVersion(version);
  }
}
