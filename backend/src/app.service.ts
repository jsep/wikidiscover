import { Injectable } from '@nestjs/common';
import { wikipediaLanguages } from './languages';
import { GetFeatured } from './stubs/get.featured';
import * as fs from 'fs';

/// TODO remove duplicate interfaces
export interface Article {
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
  mostRead: MostReadArticle[];
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

    let result = await attempt(() => fetch(url));
    if (result.error) {
      return {
        error: new WikipediaRequestError(
          `Failed to fetch Wikipedia feed. Details: ${result.error}`,
        ),
        value: null,
      };
    }

    //@ts-ignore
    result = await attempt(async () => await nonNull(result.value).json());
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
    return {
      error: null,
      value: {
        date: `${year}-${month}-${day}`,
        lang,
        tfa: tfa.error ? null : tfa.value,
        image: image.error ? null : image.value,
        mostRead: [],
        onThisDay: [],
      },
    };
    // try {
    //   return {
    //     date: `${year}-${month}-${day}`,
    //     lang,
    //     tfa: {
    //       title: response.tfa.normalizedtitle,
    //       description: response.tfa.description,
    //       dir: response.tfa.dir,
    //       lang: response.tfa.lang,
    //       timestamp: response.tfa.timestamp,
    //       content_urls: {
    //         desktop: response.tfa.content_urls.desktop.page,
    //         mobile: response.tfa.content_urls.mobile.page,
    //       },
    //       thumbnail: {
    //         height: response.tfa.thumbnail.height,
    //         width: response.tfa.thumbnail.width,
    //         source: response.tfa.thumbnail.source,
    //       },
    //     },
    //     image: response.image
    //       ? {
    //           title: response.image.title,
    //           content_urls: {
    //             desktop: response.image.file_page,
    //             mobile: response.image.file_page,
    //           },
    //           thumbnail: {
    //             height: response.image.thumbnail.height,
    //             width: response.image.thumbnail.width,
    //             source: response.image.thumbnail.source,
    //           },
    //           description: response.image.description?.text || '',
    //         }
    //       : null,
    //     mostRead: response.mostread.articles.map((article) => ({
    //       title: article.title,
    //       description: article.description || '', // Ensure description is a string
    //       views: article.views,
    //       rank: article.rank,
    //       // TODO handle thumbnail to place holder
    //       thumbnail: {
    //         height: article.thumbnail?.height || 0,
    //         width: article.thumbnail?.width || 0,
    //         source: article.thumbnail?.source || '',
    //       },
    //       timestamp: article.timestamp,
    //       lang: article.lang,
    //       dir: article.dir,
    //       content_urls: {
    //         desktop: article.content_urls.desktop.page,
    //         mobile: article.content_urls.mobile.page,
    //       },
    //     })),
    //     onThisDay: response.onthisday.map((onThisDay) => ({
    //       title: onThisDay.pages[0].titles.normalized,
    //       year: onThisDay.year,
    //       description: onThisDay.text,
    //       timestamp: new Date(onThisDay.year).toISOString(),
    //       lang: lang,
    //       content_urls: {
    //         desktop: onThisDay.pages[0].content_urls.desktop.page,
    //         mobile: onThisDay.pages[0].content_urls.mobile.page,
    //       },
    //       thumbnail: {
    //         height: onThisDay.pages[0]?.thumbnail?.height || 0,
    //         width: onThisDay.pages[0]?.thumbnail?.width || 0,
    //         source: onThisDay.pages[0]?.thumbnail?.source || '',
    //       },
    //       views: null,
    //     })),
    //   };
    // } catch (error) {
    //   console.log('error:', error);
    //   return null;
    // }
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
    try {
      return {
        error: null,
        value: {
          title: response.tfa.normalizedtitle,
          description: response.tfa.description,
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
        },
      };
    } catch (error) {
      return {
        error: new Error('Failed to get TFA. Details: ' + error),
        value: null,
      };
    }
  }

  private getImage(response: WikipediaResponse): Result<Image, Error> {
    if (!response.image) {
      return {
        error: new Error('Missing image in response'),
        value: null,
      };
    }
    try {
      return {
        error: null,
        value: {
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
        },
      };
    } catch (error) {
      return {
        error: new Error('Failed to get image. Details: ' + error),
        value: null,
      };
    }
  }
}

export type Result<T, Err> =
  | { error: null; value: T }
  | { error: Err; value: null };

async function attempt<T, Err = Error>(
  fun: () => Promise<T>,
): Promise<Result<T, Err>> {
  try {
    return {
      error: null,
      value: await fun(),
    };
  } catch (error) {
    return {
      error: error as Err,
      value: null,
    };
  }
}

export class WikipediaRequestError extends Error {}

function nonNull<T>(value: T | null | undefined): T {
  if (value == null) {
    throw new Error('Value is null or undefined');
  }
  return value;
}
