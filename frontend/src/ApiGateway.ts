import { GetFeedStub } from './TestTools/stubs/get.feed.stub';
import { dateToIso, IsoDateString } from './utils';

export type Result<Value, Error> = {
  value: Value | null;
  error: Error | null;
};

export function ok<Value, Error>(value: Value): Result<Value, Error> {
  return { value, error: null };
}

export function err<Value, Error>(error: Error): Result<Value, Error> {
  return { value: null, error };
}

interface BaseArticleDto {
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
  extract: string;
}

interface OnThisDayDto extends BaseArticleDto {
  year: number;
}

interface MostReadArticleDto extends BaseArticleDto {
  views: number;
  rank: number;
}

interface ImageDto {
  title: string;
  thumbnail: {
    source: string;
    width: number;
    height: number;
  };
  file_page: string;
  artist: {
    html: string;
    text: string;
  };
  credit: {
    html: string;
    text: string;
  };
  license: {
    type: string;
    url: string;
  };
  description: string;
}

export interface FeedDto {
  tfa: BaseArticleDto;
  image: ImageDto;
  mostRead: MostReadArticleDto[];
  onThisDay: OnThisDayDto[];
  lang: string;
  date: IsoDateString;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public data: unknown,
  ) {
    super(message);
  }
}

export class ApiGateway {
  apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL;
    if (!this.apiUrl) {
      throw new Error('VITE_API_URL is not set');
    }
  }

  public async get<T>(path: string): Promise<Result<T, ApiError>> {
    try {
      const response = await fetch(this.apiUrl + path);
      return ok(await response.json());
    } catch (error) {
      return err(new ApiError('Error fetching data for path ' + path, error));
    }
  }

  public async getFeed(
    date: Date,
    lang: string,
  ): Promise<Result<FeedDto, ApiError>> {
    if (import.meta.env.VITE_FAKE_API) {
      return this.fakeGetFeed(date, lang);
    }
    const formattedDate = dateToIso(date).split('-').join('-');
    const path = `/feed/${lang}/${formattedDate}`;
    const { error, value } = await this.get<FeedDto>(path);
    if (error) {
      return err(error);
    } else if (!value) {
      return err(new ApiError('Unsuccessful response from server', value));
    }
    return ok(value);
  }

  private fakeGetFeed(
    date: Date,
    lang: string,
  ): Promise<Result<FeedDto, ApiError>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(GetFeedStub(date, lang));
      }, 1000);
    });
  }
}
