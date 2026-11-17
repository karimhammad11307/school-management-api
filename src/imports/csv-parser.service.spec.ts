import { describe, it, expect, beforeEach } from 'vitest';
import { CsvParserService } from './csv-parser.service.js';

describe('CsvParserService', () => {
  let service: CsvParserService;

  beforeEach(() => {
    service = new CsvParserService();
  });

  it('parses csv string with quotes and commas', () => {
    const csv = 'name,email,role\n"Doe, John",john@school.local,admin\nJane,jane@school.local,teacher';
    const rows = service.parseString(csv);

    expect(rows.length).toBe(2);
    expect(rows[0].rowNumber).toBe(2);
    expect(rows[0].raw['name']).toBe('Doe, John');
    expect(rows[0].raw['email']).toBe('john@school.local');
    expect(rows[1].rowNumber).toBe(3);
    expect(rows[1].raw['name']).toBe('Jane');
  });

  it('returns empty array on empty string', () => {
    expect(service.parseString('')).toEqual([]);
    expect(service.parseString('   \n  ')).toEqual([]);
  });
});
