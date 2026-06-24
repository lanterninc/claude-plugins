import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { CUSTOMER_SKILLS, COMMANDS, PLUGINS, repoRoot, listSkillDirs, listCommandFiles, agentPath } from './repo.js';
import { join } from 'node:path';

describe('plugin completeness', () => {
  for (const plugin of PLUGINS) {
    describe(`plugin: ${plugin}`, () => {
      it('GIVEN the plugin WHEN skill dirs listed THEN all 5 customer skills are present', () => {
        const skills = listSkillDirs(plugin);
        for (const expected of CUSTOMER_SKILLS) {
          expect(skills, `Missing customer skill: ${expected}`).toContain(expected);
        }
      });

      it('GIVEN the plugin WHEN command files listed THEN all 4 commands are present', () => {
        const commands = listCommandFiles(plugin);
        for (const expected of COMMANDS) {
          expect(commands, `Missing command: ${expected}`).toContain(expected);
        }
      });

      it('GIVEN the plugin WHEN subagent path checked THEN lantern-analyst.md exists', () => {
        expect(existsSync(agentPath(plugin))).toBe(true);
      });
    });
  }
});

describe('repo path helpers', () => {
  it('GIVEN repoRoot() WHEN called THEN returns a path containing package.json', () => {
    const root = repoRoot();
    expect(existsSync(join(root, 'package.json'))).toBe(true);
  });

  it('GIVEN listSkillDirs for a non-existent plugin WHEN called THEN returns empty array', () => {
    const result = listSkillDirs('nonexistent-plugin');
    expect(result).toEqual([]);
  });

  it('GIVEN listCommandFiles for a non-existent plugin WHEN called THEN returns empty array', () => {
    const result = listCommandFiles('nonexistent-plugin');
    expect(result).toEqual([]);
  });
});
