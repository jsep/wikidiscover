import { Injectable } from '@nestjs/common';
import { wikipediaLanguages } from './languages';

@Injectable()
export class AppService {
  supportedLanguages: string[];
  constructor() {
    this.supportedLanguages = wikipediaLanguages.map(
      (language) => language.code,
    );
  }

  getSupportedLanguages() {
    return wikipediaLanguages;
  }

  async getFeed({
    year,
    month,
    day,
    lang,
  }: {
    lang: string;
    year: string;
    month: string;
    day: string;
  }) {
    if (!this.isValidDate(year, month, day)) {
      throw new Error('Invalid date');
    }
    if (!this.supportedLanguages.includes(lang)) {
      throw new Error(
        `Unsupported language. \n Supported languages: ${this.supportedLanguages.join(',')}`,
      );
    }
    return `${year}-${month}-${day} Lang:${lang}`;
  }

  private isValidDate(year: string, month: string, day: string): boolean {
    // const date = new Date(Date.UTC(year, month, day));
    const date = new Date(`${year}-${month}-${day}`);
    return (
      date.getUTCFullYear() === parseInt(year) &&
      date.getUTCMonth() + 1 === parseInt(month) &&
      date.getUTCDate() === parseInt(day)
    );
  }
}
