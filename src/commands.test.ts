import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import {
  PLUGINS,
  KNOWN_TOOLS,
  repoRoot,
  listCommandFiles,
  loadFrontmatter,
  collectToolRefs,
} from './repo.js';
import { FrontmatterSchema } from './schemas.js';

describe('command markdown files', () => {
  for (const plugin of PLUGINS) {
    const commands = listCommandFiles(plugin);

    describe(`plugin: ${plugin}`, () => {
      it('GIVEN the commands directory WHEN enumerated THEN at least one command exists', () => {
        expect(commands.length).toBeGreaterThan(0);
      });

      for (const cmd of commands) {
        const cmdPath = join(repoRoot(), 'plugins', plugin, 'commands', `${cmd}.md`);

        describe(`command: ${cmd}`, () => {
          it(`GIVEN ${cmd}.md WHEN frontmatter parsed THEN it has a non-empty description`, () => {
            const { data } = loadFrontmatter(cmdPath);
            const result = FrontmatterSchema.safeParse(data);
            expect(result.success, result.error?.message).toBe(true);
          });

          it(`GIVEN ${cmd}.md body WHEN tool refs collected THEN at least one KNOWN_TOOL is referenced`, () => {
            const { body } = loadFrontmatter(cmdPath);
            const refs = collectToolRefs(body);
            const knownSet = new Set(KNOWN_TOOLS);
            const known = refs.filter((r) => knownSet.has(r));
            expect(
              known.length,
              `${plugin}/${cmd}.md references no known tools`,
            ).toBeGreaterThan(0);
          });

          it(`GIVEN ${cmd}.md body WHEN tool refs collected THEN it references ZERO invented tools`, () => {
            const { body } = loadFrontmatter(cmdPath);
            const refs = collectToolRefs(body);
            const knownSet = new Set(KNOWN_TOOLS);
            const invented = refs.filter((r) => !knownSet.has(r));
            expect(invented, `${plugin}/${cmd}.md references invented tools`).toEqual([]);
          });
        });
      }
    });
  }

  // M1: the $ARGUMENTS interpolation contract — argument-taking commands must
  // carry the token; the argument-free `brands` command must not.
  const ARG_COMMANDS = ['analyze', 'products', 'visibility'];
  const NO_ARG_COMMANDS = ['brands'];

  for (const plugin of PLUGINS) {
    for (const cmd of ARG_COMMANDS) {
      it(`GIVEN ${plugin}/${cmd}.md WHEN body examined THEN it interpolates $ARGUMENTS`, () => {
        const cmdPath = join(repoRoot(), 'plugins', plugin, 'commands', `${cmd}.md`);
        const { body } = loadFrontmatter(cmdPath);
        expect(body, `${plugin}/${cmd}.md must reference $ARGUMENTS`).toContain('$ARGUMENTS');
      });
    }

    for (const cmd of NO_ARG_COMMANDS) {
      it(`GIVEN ${plugin}/${cmd}.md WHEN body examined THEN it does NOT use $ARGUMENTS`, () => {
        const cmdPath = join(repoRoot(), 'plugins', plugin, 'commands', `${cmd}.md`);
        const { body } = loadFrontmatter(cmdPath);
        expect(body.includes('$ARGUMENTS'), `${plugin}/${cmd}.md is argument-free`).toBe(false);
      });
    }
  }
});
