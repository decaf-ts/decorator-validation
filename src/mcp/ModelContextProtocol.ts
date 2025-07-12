import { FastMCP, Tool } from "fastmcp";
import { Logger, Logging } from "@decaf-ts/logging";
import { FastMCPSessionAuth } from "./types";

export class ModelContextProtocol<Auth extends FastMCPSessionAuth = undefined> {
  protected get log(): Logger {
    return Logging.for(this as any);
  }

  constructor(protected readonly mcp: FastMCP<Auth>) {}

  static readonly Builder = class Builder {
    name!: string;
    version!: `${number}.${number}.${number}`;
    tools: Record<string, Tool<any, any>> = {};

    log = Logging.for("MCP Builder");

    constructor() {}

    setName(value: string) {
      this.name = value;
      this.log.debug(`name set to ${value}`);
      return this;
    }

    setVersion(value: string) {
      this.version = ModelContextProtocol.validateVersion(value);
      this.log.debug(`version set to ${value}`);
      return this;
    }

    addTool<Auth extends FastMCPSessionAuth = undefined>(
      config: Tool<Auth, any>
    ) {
      const { name } = config;
      if (name in this.tools)
        throw new Error(`tool ${name} already registered`);
      this.tools[name] = config;
      this.log.debug(`tool ${name} added`);
      return this;
    }

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
  };

  static get builder() {
    return new ModelContextProtocol.Builder();
  }

  private static validateVersion(
    version: string
  ): `${number}.${number}.${number}` {
    const regexp = /(\d+)\.(\d+)\.(\d+)/g;
    const match = regexp.exec(version);
    if (!match)
      throw new Error(
        `Invalid version string. should obey semantic versioning: ${version}`
      );
    return `${match[1]}.${match[2]}.${match[3]}` as `${number}.${number}.${number}`;
  }
}
