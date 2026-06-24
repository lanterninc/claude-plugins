import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  PLUGINS,
  KNOWN_TOOLS,
  repoRoot,
  listSkillDirs,
  loadFrontmatter,
  collectToolRefs,
} from './repo.js';
import { FrontmatterSchema } from './schemas.js';

describe('skill SKILL.md files', () => {
  for (const plugin of PLUGINS) {
    const skills = listSkillDirs(plugin);

    describe(`plugin: ${plugin}`, () => {
      it('GIVEN the skill directories WHEN enumerated THEN at least one skill exists', () => {
        expect(skills.length).toBeGreaterThan(0);
      });

      for (const skill of skills) {
        const skillPath = join(repoRoot(), 'plugins', plugin, 'skills', skill, 'SKILL.md');

        describe(`skill: ${skill}`, () => {
          it(`GIVEN ${skill}/SKILL.md WHEN frontmatter parsed THEN it has a non-empty description`, () => {
            const { data } = loadFrontmatter(skillPath);
            const result = FrontmatterSchema.safeParse(data);
            expect(result.success, result.error?.message).toBe(true);
          });

          it(`GIVEN ${skill}/SKILL.md body WHEN tool refs collected THEN at least one KNOWN_TOOL is referenced`, () => {
            const { body } = loadFrontmatter(skillPath);
            const refs = collectToolRefs(body);
            const knownSet = new Set(KNOWN_TOOLS);
            const known = refs.filter((r) => knownSet.has(r));
            expect(
              known.length,
              `${plugin}/${skill}/SKILL.md references no known tools`,
            ).toBeGreaterThan(0);
          });

          it(`GIVEN ${skill}/SKILL.md body WHEN tool refs collected THEN it references ZERO invented tools`, () => {
            const { body } = loadFrontmatter(skillPath);
            const refs = collectToolRefs(body);
            const knownSet = new Set(KNOWN_TOOLS);
            // Localizes a typo'd ref to this file, so a valid sibling ref can't mask it.
            const invented = refs.filter((r) => !knownSet.has(r));
            expect(invented, `${plugin}/${skill}/SKILL.md references invented tools`).toEqual([]);
          });
        });
      }
    });
  }

  // Brand-scoped skills must mention get_visibility_brands
  const brandScopedSkills = ['ai-visibility', 'citations', 'product-quality', 'website-analysis', 'competitors'];

  for (const plugin of PLUGINS) {
    for (const skill of brandScopedSkills) {
      it(`GIVEN ${plugin}/${skill}/SKILL.md WHEN body examined THEN it mentions get_visibility_brands`, () => {
        const skillPath = join(repoRoot(), 'plugins', plugin, 'skills', skill, 'SKILL.md');
        const { body } = loadFrontmatter(skillPath);
        expect(body).toContain('get_visibility_brands');
      });
    }
  }
});

describe('FrontmatterSchema helper coverage', () => {
  it('GIVEN frontmatter with empty description WHEN parsed THEN the schema rejects it', () => {
    const result = FrontmatterSchema.safeParse({ description: '' });
    expect(result.success).toBe(false);
  });

  it('GIVEN frontmatter missing description WHEN parsed THEN the schema rejects it', () => {
    const result = FrontmatterSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('GIVEN frontmatter with valid description WHEN parsed THEN the schema accepts it', () => {
    const result = FrontmatterSchema.safeParse({ description: 'A valid description.' });
    expect(result.success).toBe(true);
  });
});
