import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PLUGINS,
  KNOWN_TOOLS,
  repoRoot,
  listSkillDirs,
  listCommandFiles,
  agentPath,
  collectToolRefs,
} from './repo.js';

/** Gather every text blob (skill body + command body + agent body) across both plugins. */
function allTextBlobs(): string[] {
  const blobs: string[] = [];
  const root = repoRoot();
  for (const plugin of PLUGINS) {
    // Skills
    for (const skill of listSkillDirs(plugin)) {
      const skillPath = join(root, 'plugins', plugin, 'skills', skill, 'SKILL.md');
      blobs.push(readFileSync(skillPath, 'utf-8'));
    }
    // Commands
    for (const cmd of listCommandFiles(plugin)) {
      const cmdPath = join(root, 'plugins', plugin, 'commands', `${cmd}.md`);
      blobs.push(readFileSync(cmdPath, 'utf-8'));
    }
    // Subagent
    blobs.push(readFileSync(agentPath(plugin), 'utf-8'));
  }
  return blobs;
}

describe('tool integrity', () => {
  it('GIVEN all skills, commands, and agents WHEN tool refs collected THEN every ref is in KNOWN_TOOLS', () => {
    const blobs = allTextBlobs();
    const allRefs = new Set<string>();
    for (const blob of blobs) {
      for (const ref of collectToolRefs(blob)) {
        allRefs.add(ref);
      }
    }
    const knownSet = new Set(KNOWN_TOOLS);
    const invented = [...allRefs].filter((ref) => !knownSet.has(ref));
    expect(invented, `Invented (unknown) tool refs: ${invented.join(', ')}`).toEqual([]);
  });

  it('GIVEN all content WHEN searched THEN findings.get_visibility_brands appears at least once (bootstrap tool present)', () => {
    const allText = allTextBlobs().join('\n');
    const refs = collectToolRefs(allText);
    expect(refs).toContain('findings.get_visibility_brands');
  });

  // H1: agent body bare refs are now covered
  for (const plugin of PLUGINS) {
    it(`GIVEN the ${plugin} agent body WHEN bare refs collected THEN result is non-empty (bare shorthand detected)`, () => {
      const agentBody = readFileSync(agentPath(plugin), 'utf-8');
      const refs = collectToolRefs(agentBody);
      expect(
        refs.length,
        'Expected bare tool refs to be detected in the agent body',
      ).toBeGreaterThan(0);
    });
  }

  // H1: a bare typo in any artifact is flagged as an invented ref
  it('GIVEN a text blob with a bare typo (get_brand_scoers) WHEN refs collected THEN the typo surfaces as an invented ref', () => {
    const blobWithTypo =
      'Call `get_brand_scoers` and `get_overview` for this brand. Also use `findings.get_visibility_brands`.';
    const refs = collectToolRefs(blobWithTypo);
    const knownSet = new Set(KNOWN_TOOLS);
    const invented = refs.filter((r) => !knownSet.has(r));
    // findings.get_brand_scoers is the normalised form of the bare typo
    expect(invented).toContain('findings.get_brand_scoers');
  });

  // H3: reverse coverage — every KNOWN_TOOLS entry must appear in >=1 artifact
  it('GIVEN KNOWN_TOOLS WHEN all artifacts scanned THEN every entry appears at least once (no dead/fictional tools)', () => {
    const allText = allTextBlobs().join('\n');
    const allRefs = new Set(collectToolRefs(allText));
    const missing = KNOWN_TOOLS.filter((tool) => !allRefs.has(tool));
    expect(
      missing,
      `KNOWN_TOOLS entries with zero artifact coverage (dead or fictional): ${missing.join(', ')}`,
    ).toEqual([]);
  });
});

describe('collectToolRefs helper', () => {
  it('GIVEN text with tool references WHEN collected THEN returns deduped list', () => {
    const text =
      'call `findings.get_visibility_brands`, then `findings.get_brand_scores` and again `findings.get_visibility_brands`';
    const refs = collectToolRefs(text);
    expect(refs).toContain('findings.get_visibility_brands');
    expect(refs).toContain('findings.get_brand_scores');
    // deduplication: get_visibility_brands appears only once
    const count = refs.filter((r) => r === 'findings.get_visibility_brands').length;
    expect(count).toBe(1);
  });

  it('GIVEN text with no tool references WHEN collected THEN returns empty array', () => {
    expect(collectToolRefs('no tools here')).toEqual([]);
  });

  it('GIVEN empty string WHEN collected THEN returns empty array', () => {
    expect(collectToolRefs('')).toEqual([]);
  });

  it('GIVEN text where findings. appears at a word boundary WHEN collected THEN matches correctly', () => {
    const text = 'use findings.get_overview but not xfindings.get_overview';
    const refs = collectToolRefs(text);
    // \b means 'findings.get_overview' matches but 'xfindings.get_overview' should not
    expect(refs).toContain('findings.get_overview');
    // xfindings should not yield any extra ref
    const xRefs = refs.filter((r) => r === 'findings.get_overview');
    expect(xRefs.length).toBe(1);
  });

  // H2: end-anchored pattern — camelCase must not collapse to a known prefix
  it('GIVEN text with findings.getOverview (camelCase) WHEN collected THEN it is NOT matched', () => {
    const refs = collectToolRefs('use findings.getOverview here');
    // findings.getOverview contains uppercase — must be rejected
    expect(refs).not.toContain('findings.getOverview');
    expect(refs).not.toContain('findings.get');
  });

  // H2: end-anchored pattern — suffixed variant must not collapse to known name
  it('GIVEN text with findings.get_overview2 WHEN collected THEN it is captured as-is (not silently collapsed)', () => {
    const refs = collectToolRefs('call findings.get_overview2 here');
    // findings.get_overview2 is NOT a known tool — it should appear as-is so the
    // downstream KNOWN_TOOLS check can flag it as invented.
    expect(refs).toContain('findings.get_overview2');
    expect(refs).not.toContain('findings.get_overview');
  });

  // H1: bare form detection
  it('GIVEN text with bare get_brand_scores WHEN collected THEN findings.get_brand_scores is returned', () => {
    const refs = collectToolRefs('Call `get_brand_scores` for the brand.');
    expect(refs).toContain('findings.get_brand_scores');
  });

  it('GIVEN text with bare compare_brands WHEN collected THEN findings.compare_brands is returned', () => {
    const refs = collectToolRefs('Use compare_brands to compare.');
    expect(refs).toContain('findings.compare_brands');
  });

  it('GIVEN text with bare explain_citation_telemetry WHEN collected THEN findings.explain_citation_telemetry is returned', () => {
    const refs = collectToolRefs('Use explain_citation_telemetry.');
    expect(refs).toContain('findings.explain_citation_telemetry');
  });

  it('GIVEN text with bare check_analysis_status WHEN collected THEN findings.check_analysis_status is returned', () => {
    const refs = collectToolRefs('Call check_analysis_status now.');
    expect(refs).toContain('findings.check_analysis_status');
  });

  // H1: bare typo must surface as invented ref
  it('GIVEN text with a bare typo get_brand_scoers WHEN collected THEN it normalises to findings.get_brand_scoers (not a known tool)', () => {
    const refs = collectToolRefs('Call `get_brand_scoers` here.');
    expect(refs).toContain('findings.get_brand_scoers');
    const knownSet = new Set(KNOWN_TOOLS);
    expect(knownSet.has('findings.get_brand_scoers')).toBe(false);
  });
});
