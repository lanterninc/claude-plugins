import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { loadMarketplace, repoRoot } from './repo.js';
import { MarketplaceSchema, PluginManifestSchema } from './schemas.js';

describe('marketplace.json', () => {
  it('GIVEN the marketplace file exists WHEN parsed THEN it matches the schema', () => {
    const raw = loadMarketplace();
    const result = MarketplaceSchema.safeParse(raw);
    expect(result.success, result.error?.message).toBe(true);
  });

  // L2: split folded multi-assertion test into individual it() blocks
  it('GIVEN the marketplace WHEN read THEN it has a non-empty name', () => {
    const parsed = MarketplaceSchema.parse(loadMarketplace());
    expect(parsed.name.length).toBeGreaterThan(0);
  });

  it('GIVEN the marketplace WHEN read THEN it has a non-empty owner name', () => {
    const parsed = MarketplaceSchema.parse(loadMarketplace());
    expect(parsed.owner.name.length).toBeGreaterThan(0);
  });

  it('GIVEN the marketplace WHEN read THEN it has a non-empty description', () => {
    const parsed = MarketplaceSchema.parse(loadMarketplace());
    expect(parsed.description.length).toBeGreaterThan(0);
  });

  it('GIVEN the marketplace WHEN plugins listed THEN at least one plugin is declared with unique names', () => {
    const parsed = MarketplaceSchema.parse(loadMarketplace());
    const names = parsed.plugins.map((p) => p.name);
    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names).size).toBe(names.length);
  });

  it('GIVEN each plugin entry WHEN source is resolved THEN the directory exists on disk', () => {
    const parsed = MarketplaceSchema.parse(loadMarketplace());
    for (const plugin of parsed.plugins) {
      const absSource = join(repoRoot(), plugin.source);
      expect(existsSync(absSource), `source dir ${plugin.source} does not exist`).toBe(true);
    }
  });

  // H4: per-entry plugin.json name must match marketplace entry name
  it('GIVEN each plugin entry WHEN plugin.json loaded THEN plugin.json name === marketplace entry name', () => {
    const parsed = MarketplaceSchema.parse(loadMarketplace());
    for (const entry of parsed.plugins) {
      const absSource = join(repoRoot(), entry.source);
      const manifestRaw = JSON.parse(
        readFileSync(join(absSource, '.claude-plugin', 'plugin.json'), 'utf-8'),
      ) as unknown;
      const manifest = PluginManifestSchema.parse(manifestRaw);
      expect(
        manifest.name,
        `plugin.json name "${manifest.name}" does not match marketplace entry name "${entry.name}"`,
      ).toBe(entry.name);
    }
  });

  // H4: basename of source directory must equal marketplace entry name
  it('GIVEN each plugin entry WHEN source basename checked THEN basename(source) === entry.name', () => {
    const parsed = MarketplaceSchema.parse(loadMarketplace());
    for (const entry of parsed.plugins) {
      const dirName = basename(entry.source);
      expect(
        dirName,
        `basename of source "${entry.source}" is "${dirName}", expected "${entry.name}"`,
      ).toBe(entry.name);
    }
  });

  it('GIVEN an object missing required fields WHEN parsed THEN the schema rejects it', () => {
    const result = MarketplaceSchema.safeParse({ name: 'x' });
    expect(result.success).toBe(false);
  });
});
