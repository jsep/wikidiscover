import {
  attemptAsync,
  dateToIso,
  err,
  IsoDateString,
  nonNull,
  ok,
  Result,
} from './utils';

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

export interface ImageDTO extends ArticleDTO {}
export interface MostReadArticleDTO extends ArticleDTO {}
export interface OnThisDayDTO extends ArticleDTO {}
export interface TFADTO extends ArticleDTO {}

export interface FeedDto {
  error: string | null;
  data: {
    tfa: TFADTO;
    image: ImageDTO;
    mostReadArticles: MostReadArticleDTO[];
    onThisDay: OnThisDayDTO[];
    lang: string;
    date: IsoDateString;
  };
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

  async markArticleAsRead(id: string) {
    // use local storage to save the article as read
    localStorage.setItem(id + '-read', 'true');
  }

  isArticleRead(id: string) {
    return localStorage.getItem(id + '-read') === 'true';
  }

  public async get<T>(path: string): Promise<Result<T, ApiError>> {
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
  ): Promise<Result<FeedDto, ApiError>> {
    const formattedDate = dateToIso(date).split('-').join('/');
    const path = `/feed/${lang}/featured/${formattedDate}`;
    // Change type with FeedDtoResponse
    const { error, value } = await this.get<FeedDto>(path);

    if (error) {
      return err(error);
    } else if (!value || value.error) {
      return err(new ApiError('Unsuccessful response from server', value));
    }

    return ok(value);
  }
}
