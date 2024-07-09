import { Injectable } from '@nestjs/common';
import { wikipediaLanguages } from './languages';
import { GetFeatured } from './stubs/get.featured';
import * as fs from 'fs';
import { Result, attempt, attemptAsync, nonNull } from './utils';

/// TODO remove duplicate interfaces
export interface Article {
  id: number | string;
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
  ): Promise<Result<WikipediaResponse, Error>> {
    //    api.wikimedia.org/feed/v1/wikipedia/en/featured/2024/07/04
    const url = `https://api.wikimedia.org/feed/v1/wikipedia/${lang}/featured/${year}/${month}/${day}`;

    let result = await attemptAsync(() => fetch(url));
    if (result.error) {
      return {
        error: new WikipediaRequestError(
          `Failed to fetch Wikipedia feed. Details: ${result.error}`,
        ),
        value: null,
      };
    }

    //@ts-ignore
    result = await attemptAsync(async () => await nonNull(result.value).json());
    if (result.error) {
      return {
        error: new WikipediaRequestError(
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
      value: result.value as unknown as WikipediaResponse,
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
  }): Promise<Result<FeedResponse, Error>> {
    if (!this.isValidDate(year, month, day)) {
      return {
        error: new Error('Invalid date'),
        value: null,
      };
    }

    if (!this.supportedLanguages.includes(lang)) {
      return {
        error: new Error(
          `Unsupported language. \n Supported languages: ${this.supportedLanguages.join(',')}`,
        ),
        value: null,
      };
    }

    const result = await this.wikipediaRequest(lang, year, month, day);

    if (result.error) {
      return {
        error: result.error,
        value: null,
      };
    }

    const response = result.value;
    const tfa = this.getTFA(response);
    const image = this.getImage(response);
    const mostReadArticles = this.getMostReadArticles(response);
    const onThisDay = this.getOnThisDay(response);
    return {
      error: null,
      value: {
        date: `${year}-${month}-${day}`,
        lang,
        tfa: tfa.error ? null : tfa.value,
        image: image.error ? null : image.value,
        mostReadArticles: mostReadArticles.error ? [] : mostReadArticles.value,
        onThisDay: onThisDay.error ? [] : onThisDay.value,
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

  private getTFA(response: WikipediaResponse): Result<TFA, Error> {
    if (!response.tfa) {
      return {
        // this is an expected error, not all responses contain TFA
        error: new Error('Missing TFA in response'),
        value: null,
      };
    }
    const result = attempt<TFA>(() => {
      return {
        id: response.tfa.pageid,
        title: response.tfa.normalizedtitle,
        description: response.tfa.extract,
        timestamp: response.tfa.timestamp,
        urls: {
          desktop: response.tfa.content_urls.desktop.page,
          mobile: response.tfa.content_urls.mobile.page,
        },
        thumbnail: {
          height: response.tfa.thumbnail.height,
          width: response.tfa.thumbnail.width,
          source: response.tfa.thumbnail.source,
        },
      };
    });

    if (result.error) {
      return {
        error: new Error('Failed to get TFA. Details: ' + result.error),
        value: null,
      };
    }

    return result;
  }

  private getImage(response: WikipediaResponse): Result<Image, Error> {
    if (!response.image) {
      return {
        error: new Error('Missing image in response'),
        value: null,
      };
    }

    const result = attempt<Image>(() => {
      return {
        id: response.image.wb_entity_id,
        title: response.image.title,
        description: response.image.description.text,
        urls: {
          desktop: response.image.file_page,
          mobile: response.image.file_page,
        },
        timestamp: null,
        thumbnail: {
          height: response.image.thumbnail.height,
          width: response.image.thumbnail.width,
          source: response.image.thumbnail.source,
        },
      };
    });

    if (result.error) {
      console.error('Failed to get mostread. Details: ' + result.error);
      return {
        error: new Error('Failed to get image. Details: ' + result.error),
        value: null,
      };
    }

    return result;
  }

  private getMostReadArticles(
    response: WikipediaResponse,
  ): Result<MostReadArticle[], Error> {
    if (!response.mostread) {
      return {
        error: new Error('Missing mostread in response'),
        value: null,
      };
    }
    const result = attempt<MostReadArticle[]>(() => {
      return response.mostread.articles
        .map((article) => {
          const result = attempt(() => ({
            id: article.pageid,
            title: article.titles.normalized,
            description: article.extract || '',
            urls: {
              desktop: article.content_urls.desktop.page,
              mobile: article.content_urls.mobile.page,
            },
            views: article.views,
            rank: article.rank,
            timestamp: article.timestamp,
            thumbnail: !article.thumbnail
              ? null
              : {
                  height: article.thumbnail?.height || 0,
                  width: article.thumbnail?.width || 0,
                  source: article.thumbnail?.source || '',
                },
          }));
          if (result.error) {
            console.error('Failed to get most read article. ', {
              error: result.error,
              article,
            });
          }
          return result.value;
        })
        .filter((value) => value);
    });

    if (result.error) {
      console.error('Failed to get mostread. Details: ' + result.error);
      return {
        error: new Error('Failed to get most read. Details: ' + result.error),
        value: null,
      };
    }

    return result;
  }

  private getOnThisDay(
    response: WikipediaResponse,
  ): Result<OnThisDay[], Error> {
    if (!response.onthisday) {
      return {
        error: new Error('Missing onthisday in response'),
        value: null,
      };
    }

    const result = attempt<OnThisDay[]>(() => {
      return response.onthisday
        .map((onThisDay) => {
          const article = onThisDay.pages[0];
          const result = attempt(() => ({
            id: article.pageid,
            title: article.titles.normalized,
            description: onThisDay.text,
            timestamp: new Date(onThisDay.year).toISOString(),
            urls: {
              desktop: article.content_urls.desktop.page,
              mobile: article.content_urls.mobile.page,
            },
            thumbnail: !article.thumbnail
              ? null
              : {
                  height: article.thumbnail.height || 0,
                  width: article.thumbnail.width || 0,
                  source: article.thumbnail.source || '',
                },
          }));
          if (result.error) {
            console.error('Failed to get onthisday.', {
              error: result.error,
              article,
            });
          }
          return result.value;
        })
        .filter((value) => value);
    });
    if (result.error) {
      return {
        error: new Error('Failed to get onthisday. Details: ' + result.error),
        value: null,
      };
    }
    return result;
  }
}

export class WikipediaRequestError extends Error {}
