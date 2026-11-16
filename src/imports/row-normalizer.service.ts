import { Injectable } from '@nestjs/common';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class RowNormalizerService {
  cleanText(value?: string): string {
    if (!value) {
      return '';
    }
    return value.trim().replace(/\s+/g, ' ');
  }

  normalizeEmail(value?: string): string {
    return this.cleanText(value).toLowerCase();
  }

  isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
  }

  parsePositiveInt(value?: string): number | null {
    const cleaned = this.cleanText(value);
    if (!/^\d+$/.test(cleaned)) {
      return null;
    }
    const parsed = Number.parseInt(cleaned, 10);
    return parsed > 0 ? parsed : null;
  }

  pickField(raw: Record<string, string>, candidates: string[]): string {
    for (const key of candidates) {
      if (raw[key] !== undefined && raw[key].trim() !== '') {
        return raw[key];
      }
    }
    return '';
  }
}


