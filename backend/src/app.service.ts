import { Injectable } from '@nestjs/common';
import { wikipediaLanguages } from './languages';
import { GetFeatured } from './stubs/get.featured';

/// TODO remove duplicate interfaces
export interface FeedResponse {
  date: string;
  lang: string;
  tfa: TFA;
}

export interface TFA {
  title: string;
  thumbnail: {
    source: string;
    width: number;
    height: number;
  };
  lang: string;
  dir: string;
  timestamp: string;
  description: string;
  content_urls: {
    desktop: string;
    mobile: string;
  };
}

export type WikipediaResponse = ReturnType<typeof GetFeatured>;

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

  async wikipediaRequest(
    lang: string,
    year: string,
    month: string,
    day: string,
  ): Promise<{ error: any; value: WikipediaResponse }> {
    //    api.wikimedia.org/feed/v1/wikipedia/en/featured/2024/07/04
    const url = `https://api.wikimedia.org/feed/v1/wikipedia/${lang}/featured/${year}/${month}/${day}`;
    const reponse = await fetch(url);
    return {
      error: null,
      value: (await reponse.json()) as WikipediaResponse,
    };
    return {
      error: null,
      value: GetFeatured(),
    };
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
  }): Promise<{ error: any; value: FeedResponse }> {
    if (!this.isValidDate(year, month, day)) {
      throw new Error('Invalid date');
    }
    if (!this.supportedLanguages.includes(lang)) {
      throw new Error(
        `Unsupported language. \n Supported languages: ${this.supportedLanguages.join(',')}`,
      );
    }

    const result = await this.wikipediaRequest(lang, year, month, day);

    if (result.error) {
      // TODO handle wikipedia errors
      return null;
    }

    const response = result.value;
    return {
      error: null,
      value: {
        date: `${year}-${month}-${day}`,
        lang,
        tfa: {
          title: response.tfa.normalizedtitle,
          description: response.tfa.description,
          dir: response.tfa.dir,
          lang: response.tfa.lang,
          timestamp: response.tfa.timestamp,
          content_urls: {
            desktop: response.tfa.content_urls.desktop.page,
            mobile: response.tfa.content_urls.mobile.page,
          },
          thumbnail: {
            height: response.tfa.thumbnail.height,
            width: response.tfa.thumbnail.width,
            source: response.tfa.thumbnail.source,
          },
        },
      },
    };
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
