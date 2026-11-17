import { describe, it, expect, beforeEach } from 'vitest';
import { RowNormalizerService } from './row-normalizer.service.js';

describe('RowNormalizerService', () => {
  let service: RowNormalizerService;

  beforeEach(() => {
    service = new RowNormalizerService();
  });

  it('cleans text by trimming and collapsing multiple spaces', () => {
    expect(service.cleanText('   John    Doe   ')).toBe('John Doe');
    expect(service.cleanText('')).toBe('');
    expect(service.cleanText(undefined)).toBe('');
  });

  it('normalizes email to lowercase and trimmed string', () => {
    expect(service.normalizeEmail('  ADMIN@SCHOOL.LOCAL  ')).toBe('admin@school.local');
  });

  it('validates email formats correctly', () => {
    expect(service.isValidEmail('admin@school.local')).toBe(true);
    expect(service.isValidEmail('invalid-email')).toBe(false);
    expect(service.isValidEmail('')).toBe(false);
  });

  it('parses positive integers correctly', () => {
    expect(service.parsePositiveInt('25')).toBe(25);
    expect(service.parsePositiveInt('0')).toBe(null);
    expect(service.parsePositiveInt('-5')).toBe(null);
    expect(service.parsePositiveInt('abc')).toBe(null);
    expect(service.parsePositiveInt(undefined)).toBe(null);
  });

  it('picks first non-empty field among candidates', () => {
    const raw = { name: '', full_name: 'Dr. Tariq', alias: 'Tariq' };
    expect(service.pickField(raw, ['name', 'full_name', 'alias'])).toBe('Dr. Tariq');
    expect(service.pickField(raw, ['missing', 'not_found'])).toBe('');
  });
});
