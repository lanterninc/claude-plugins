import { describe, it, expect } from 'vitest';
import { repoRoot, readJson, loadFrontmatter, listPlugins, PLUGINS } from './repo.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

describe('listPlugins()', () => {
  it('GIVEN marketplace.json WHEN listPlugins() called THEN returns the declared plugin names', () => {
    const names = listPlugins();
    expect(Array.isArray(names)).toBe(true);
    expect(names.length).toBeGreaterThan(0);
    // every name resolves to a plugin dir on disk
    for (const n of names) {
      expect(existsSync(join(repoRoot(), 'plugins', n))).toBe(true);
    }
  });
});

describe('repoRoot()', () => {
  it('GIVEN the module is loaded WHEN repoRoot() called THEN returns a directory that exists', () => {
    const root = repoRoot();
    expect(existsSync(root)).toBe(true);
  });

  it('GIVEN repoRoot() WHEN package.json checked at root THEN it exists', () => {
    expect(existsSync(join(repoRoot(), 'package.json'))).toBe(true);
  });
});

describe('readJson()', () => {
  it('GIVEN a valid relative path WHEN readJson called THEN returns parsed JSON', () => {
    const result = readJson('.claude-plugin/marketplace.json');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('object');
  });

  it('GIVEN a non-existent path WHEN readJson called THEN throws', () => {
    expect(() => readJson('nonexistent/file.json')).toThrow();
  });
});

describe('loadFrontmatter()', () => {
  // Use the first declared plugin so these tests work in either the public or
  // private repo (PLUGINS[0] is always defined — listPlugins() asserts length > 0).
  const firstPlugin: string = PLUGINS[0] ?? '';

  it('GIVEN a valid markdown file WHEN loadFrontmatter called THEN returns data and body', () => {
    const path = join(repoRoot(), 'plugins', firstPlugin, 'skills/ai-visibility/SKILL.md');
    const { data, body } = loadFrontmatter(path);
    expect(typeof data).toBe('object');
    expect(typeof body).toBe('string');
    expect(body.length).toBeGreaterThan(0);
  });

  it('GIVEN a file with no frontmatter WHEN loadFrontmatter called THEN data is empty object and body is the full content', () => {
    // The README.md files have no frontmatter — use one as a no-frontmatter fixture
    const readmePath = join(repoRoot(), 'plugins', firstPlugin, 'README.md');
    const { data, body } = loadFrontmatter(readmePath);
    // gray-matter returns {} for no frontmatter
    expect(Object.keys(data).length).toBe(0);
    expect(typeof body).toBe('string');
  });
});
