import { describe, it, expect } from 'vitest';
import { artifactSurface, DEFAULT_SURFACE } from './repo.js';

describe('artifactSurface', () => {
  it('GIVEN DEFAULT_SURFACE WHEN read THEN it is the findings surface', () => {
    expect(DEFAULT_SURFACE).toBe('findings');
  });

  it('GIVEN no surface field WHEN read THEN returns the default surface', () => {
    expect(artifactSurface({})).toBe('findings');
    expect(artifactSurface({ description: 'x' })).toBe('findings');
  });

  it('GIVEN surface set to the default WHEN read THEN returns it', () => {
    expect(artifactSurface({ surface: 'findings' })).toBe('findings');
  });

  it('GIVEN a non-default surface WHEN read THEN returns it verbatim', () => {
    expect(artifactSurface({ surface: 'other' })).toBe('other');
  });

  it('GIVEN an empty-string surface WHEN read THEN falls back to the default', () => {
    expect(artifactSurface({ surface: '' })).toBe('findings');
  });

  it('GIVEN a non-string surface WHEN read THEN falls back to the default', () => {
    expect(artifactSurface({ surface: 123 })).toBe('findings');
  });
});
