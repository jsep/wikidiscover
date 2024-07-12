import { attemptAsync, dateToIso, err, nonNull, ok, Result } from './utils';
import { GetFeedRawResponse } from './TestTools/stubs/get.feed.stub';

// TODO dry
export type RawApiResponse = ReturnType<typeof GetFeedRawResponse>;
export type FeedDtoResponse = {
  error: { code: string; message: string } | null;
  value: RawApiResponse['value'];
};
export type WikipediaResponseDto = RawApiResponse['value']['wikipediaResponse'];
export type TfaDTO = WikipediaResponseDto['tfa'];
export type ImageDTO = WikipediaResponseDto['image'];
export type MostReadArticleDTO =
  WikipediaResponseDto['mostread']['articles'][0];
export type OnThisDayDTO = WikipediaResponseDto['onthisday'][0];
export type NewsDTO = WikipediaResponseDto['news'][0];

// TODO dry interfaces
export interface ArticleDTO {
  // TODO id can be string or number
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
      console.error('VITE_API_URL is not set');
    }
  }

  async markArticleAsRead(id: string) {
    // use local storage to save the article as read
    localStorage.setItem(id + '-read', 'true');
  }

  isArticleRead(id: string) {
    return localStorage.getItem(id + '-read') === 'true';
  }

  public async get<T>(path: string): Promise<Result<T, ApiError>> {
    if (!this.apiUrl) {
      console.error('VITE_API_URL is not set');
      return err(new ApiError('VITE_API_URL is not set', {}));
    }

    let result = await attemptAsync(() => fetch(this.apiUrl + path));
    if (result.error) {
      return err(
        new ApiError('Error fetching data for path ' + path, result.error),
      );
    }

    const jsonResult = await attemptAsync(async () => {
      return nonNull(result.value).json() as T;
    });

    if (jsonResult.error) {
      return err(
        new ApiError('Error parsing json data for ' + path, jsonResult.error),
      );
    }

    return jsonResult;
  }

  public async getFeed(
    date: Date,
    lang: string,
  ): Promise<Result<FeedDtoResponse, ApiError>> {
    const formattedDate = dateToIso(date).split('-').join('/');
    const path = `/feed/${lang}/featured/${formattedDate}`;
    const result = await this.get<FeedDtoResponse>(path);

    if (result.error) {
      return result;
    } else if (result.value.error) {
      console.error('Unsuccessful response from server', { result, path });
      return err(
        new ApiError('Unsuccessful response from server', result.value),
      );
    }

    return ok(result.value);
  }
}
