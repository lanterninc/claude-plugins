import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PLUGINS,
  FORBIDDEN_TOOL_PATTERNS,
  repoRoot,
  listSkillDirs,
  listCommandFiles,
  agentPath,
} from './repo.js';

/** Collect every (source path, content) pair for skills, commands, and agents. */
function allContentPairs(): Array<{ path: string; content: string }> {
  const pairs: Array<{ path: string; content: string }> = [];
  const root = repoRoot();
  for (const plugin of PLUGINS) {
    // Skills
    for (const skill of listSkillDirs(plugin)) {
      const skillPath = join(root, 'plugins', plugin, 'skills', skill, 'SKILL.md');
      pairs.push({ path: skillPath, content: readFileSync(skillPath, 'utf-8') });
    }
    // Commands
    for (const cmd of listCommandFiles(plugin)) {
      const cmdPath = join(root, 'plugins', plugin, 'commands', `${cmd}.md`);
      pairs.push({ path: cmdPath, content: readFileSync(cmdPath, 'utf-8') });
    }
    // Agents
    const ap = agentPath(plugin);
    pairs.push({ path: ap, content: readFileSync(ap, 'utf-8') });
  }
  return pairs;
}

describe('no write tools', () => {
  for (const pattern of FORBIDDEN_TOOL_PATTERNS) {
    it(`GIVEN all plugin content WHEN searched for pattern ${pattern} THEN no matches found`, () => {
      const pairs = allContentPairs();
      const hits: string[] = [];
      for (const { path, content } of pairs) {
        if (pattern.test(content)) {
          hits.push(path);
        }
      }
      expect(hits, `Forbidden pattern ${pattern} found in: ${hits.join(', ')}`).toEqual([]);
    });
  }
});

describe('FORBIDDEN_TOOL_PATTERNS helper coverage', () => {
  it('GIVEN text containing publish_ WHEN checked THEN the pattern matches', () => {
    expect(FORBIDDEN_TOOL_PATTERNS[0]?.test('findings.publish_results')).toBe(true);
  });

  it('GIVEN text not containing any forbidden pattern WHEN checked THEN no pattern matches', () => {
    const clean = 'findings.get_brand_scores findings.get_overview';
    for (const pattern of FORBIDDEN_TOOL_PATTERNS) {
      expect(pattern.test(clean)).toBe(false);
    }
  });

  it('GIVEN text containing apply_recommendation WHEN checked THEN the pattern matches', () => {
    expect(FORBIDDEN_TOOL_PATTERNS.some((p) => p.test('apply_recommendation_now'))).toBe(true);
  });

  it('GIVEN text containing draft_ WHEN checked THEN the pattern matches', () => {
    expect(FORBIDDEN_TOOL_PATTERNS.some((p) => p.test('draft_post'))).toBe(true);
  });

  it('GIVEN text containing ask_lantern WHEN checked THEN the pattern matches', () => {
    expect(FORBIDDEN_TOOL_PATTERNS.some((p) => p.test('ask_lantern_for_help'))).toBe(true);
  });

  it('GIVEN text containing edit_website WHEN checked THEN the pattern matches', () => {
    expect(FORBIDDEN_TOOL_PATTERNS.some((p) => p.test('edit_website_content'))).toBe(true);
  });
});
