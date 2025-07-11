import { Tool, ToolParameters } from "fastmcp";

export type ToolParametersType<
  T extends FastMCPSessionAuth,
  Params extends ToolParameters,
> = Tool<T, Params>;

export type FastMCPSessionAuth = Record<string, unknown> | undefined;
