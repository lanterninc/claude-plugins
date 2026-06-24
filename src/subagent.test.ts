import { describe, it, expect } from 'vitest';
import {
  PLUGINS,
  FORBIDDEN_TOOL_PATTERNS,
  agentPath,
  loadFrontmatter,
  loadMcpConfig,
} from './repo.js';
import { AgentFrontmatterSchema, McpConfigSchema } from './schemas.js';

/** Normalise the `tools` frontmatter (string or array) to a list of entries. */
function toolEntries(tools: string | string[]): string[] {
  return Array.isArray(tools) ? tools : tools.split(',').map((t) => t.trim());
}

describe('lantern-analyst subagent', () => {
  for (const plugin of PLUGINS) {
    describe(`plugin: ${plugin}`, () => {
      it('GIVEN the subagent markdown WHEN frontmatter parsed THEN it matches AgentFrontmatterSchema', () => {
        const { data } = loadFrontmatter(agentPath(plugin));
        const result = AgentFrontmatterSchema.safeParse(data);
        expect(result.success, result.error?.message).toBe(true);
      });

      it("GIVEN the subagent frontmatter WHEN name read THEN it is exactly 'lantern-analyst'", () => {
        const { data } = loadFrontmatter(agentPath(plugin));
        const fm = AgentFrontmatterSchema.parse(data);
        // Both plugins intentionally ship an agent named `lantern-analyst`.
        // The name is the /agents invocation contract and is coupled to the filename.
        expect(fm.name).toBe('lantern-analyst');
      });

      it('GIVEN the subagent frontmatter WHEN description read THEN it is non-empty', () => {
        const { data } = loadFrontmatter(agentPath(plugin));
        const fm = AgentFrontmatterSchema.parse(data);
        expect(fm.description.trim().length).toBeGreaterThan(0);
      });

      it('GIVEN the subagent frontmatter WHEN tools read THEN it grants the MCP wildcard for the .mcp.json server key', () => {
        const { data } = loadFrontmatter(agentPath(plugin));
        const fm = AgentFrontmatterSchema.parse(data);
        // Couple the wildcard to the ACTUAL .mcp.json server key, so renaming the
        // server (mcp-config) without updating the agent breaks this test.
        const mcp = McpConfigSchema.parse(loadMcpConfig(plugin));
        const serverKey = Object.keys(mcp.mcpServers)[0];
        const expectedWildcard = `mcp__${serverKey}__*`;
        expect(toolEntries(fm.tools)).toContain(expectedWildcard);
      });

      it('GIVEN the subagent body WHEN checked for forbidden patterns THEN none are present', () => {
        const { body } = loadFrontmatter(agentPath(plugin));
        for (const pattern of FORBIDDEN_TOOL_PATTERNS) {
          expect(
            pattern.test(body),
            `Forbidden pattern ${pattern} found in ${plugin} subagent body`,
          ).toBe(false);
        }
      });

      it('GIVEN the subagent tools frontmatter WHEN checked for forbidden patterns THEN none are present', () => {
        const { data } = loadFrontmatter(agentPath(plugin));
        const fm = AgentFrontmatterSchema.parse(data);
        const toolsText = toolEntries(fm.tools).join(' ');
        for (const pattern of FORBIDDEN_TOOL_PATTERNS) {
          expect(
            pattern.test(toolsText),
            `Forbidden pattern ${pattern} found in ${plugin} subagent tools frontmatter`,
          ).toBe(false);
        }
      });
    });
  }
});
