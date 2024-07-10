import { Injectable } from '@nestjs/common';
import { wikipediaLanguages } from './languages';
import { GetFeaturedContent } from './stubs/get.featured';
import * as fs from 'fs';
import { Result, attempt, attemptAsync, nonNull } from './utils';
import { WikipediaApiError } from './errors';

/// TODO remove duplicate interfaces
export interface Article {
  id: string;
  title: string;
  description: string;
  views?: number;
  rank?: number;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  urls: {
    desktop: string;
    mobile: string;
  };
  timestamp?: string;
}

export interface Image extends Article {}
export interface MostReadArticle extends Article {}
export interface OnThisDay extends Article {}
export interface TFA extends Article {}

export interface FeedResponse {
  date: string;
  lang: string;
  tfa: TFA | null;
  image: Image | null;
  mostReadArticles: MostReadArticle[];
  onThisDay: OnThisDay[];
}

export type WikipediaFeaturedContentResponse = ReturnType<
  typeof GetFeaturedContent
>;

@Injectable()
export class WikipediaService {
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
  ): Promise<Result<WikipediaFeaturedContentResponse, WikipediaApiError>> {
    //    api.wikimedia.org/feed/v1/wikipedia/en/featured/2024/07/04
    const url = `https://api.wikimedia.org/feed/v1/wikipedia/${lang}/featured/${year}/${month}/${day}`;

    let result = await attemptAsync(() => fetch(url));
    if (result.error) {
      return {
        error: new WikipediaApiError(
          `Failed to fetch Wikipedia feed. Details: ${result.error}`,
        ),
        value: null,
      };
    }

    //@ts-ignore
    result = await attemptAsync(async () => await nonNull(result.value).json());
    if (result.error) {
      return {
        error: new WikipediaApiError(
          `Failed to parse Wikipedia feed. Details: ${result.error}`,
        ),
        value: null,
      };
    }
    fs.writeFileSync(
      'wikipediaResponse.json',
      JSON.stringify({ url, response: result.value }, null, 2),
    );
    return {
      error: null,
      value: result.value as unknown as WikipediaFeaturedContentResponse,
    };
  }

  /**
   * Returns featured content from Wikipedia for a given date.
   * Depending on language availability, the response can include the daily featured article, featured image or media file, list of most read articles, latest news stories, and events from that day in history.
   * https://api.wikimedia.org/wiki/Feed_API/Reference/Featured_content
   */
  async getFeaturedContent(
    lang: string,
    year: string,
    month: string,
    day: string,
  ): Promise<Result<WikipediaFeaturedContentResponse, WikipediaApiError>> {
    if (!this.isValidDate(year, month, day)) {
      return {
        error: new WikipediaApiError('Invalid date'),
        value: null,
      };
    }
    return this.wikipediaRequest(lang, year, month, day);
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
