import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';

export interface ParsedCsvRow {
  rowNumber: number;
  raw: Record<string, string>;
}

@Injectable()
export class CsvParserService {
  async parseFile(filePath: string): Promise<ParsedCsvRow[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    return this.parseString(content);
  }

  parseString(content: string): ParsedCsvRow[] {
    const cleaned = content.replace(/^\uFEFF/, '');
    const lines = this.splitLines(cleaned);
    if (lines.length === 0) {
      return [];
    }

    const headers = this.parseLine(lines[0]).map((h) => this.normalizeHeader(h));
    const rows: ParsedCsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') {
        continue;
      }

      const values = this.parseLine(line);
      const raw: Record<string, string> = {};
      headers.forEach((header, idx) => {
        raw[header] = values[idx] ?? '';
      });

      rows.push({
        rowNumber: i + 1,
        raw,
      });
    }

    return rows;
  }

  private normalizeHeader(header: string): string {
    return header.trim().toLowerCase().replace(/[\s-]+/g, '_');
  }

  private splitLines(text: string): string[] {
    const lines: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '""';
          i++;
          continue;
        }
        inQuotes = !inQuotes;
        current += char;
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && text[i + 1] === '\n') {
          i++;
        }
        lines.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    if (current.length > 0) {
      lines.push(current);
    }

    return lines;
  }

  private parseLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    fields.push(current);
    return fields;
  }
}
