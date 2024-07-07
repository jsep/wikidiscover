import { ApiGateway } from '../ApiGateway';
import { IsoDateString, dateToIso } from '../utils';

export interface ArticulePM {
  title: string;
  url: {
    desktop: string;
    mobile: string;
  };
  thumbnailUrl: string;
  formattedDate: string;
  views: number | null;
  badges: string[];
}

export interface FeedPm {
  date: IsoDateString;
  lang: string;
  tfa: ArticulePM;
  articles: ArticulePM[];
}

class FeedRepository {
  apiGateway: ApiGateway;

  constructor() {
    this.apiGateway = new ApiGateway();
  }

  async getFeed(date: Date, lang: string): Promise<FeedPm> {
    const result = await this.apiGateway.getFeed(date, lang);
    if (result.error || !result.value) {
      // TODO handle error
      throw new Error(result.error?.message ?? 'Unknown error');
    }
    const feedDto = result.value;

    return {
      date: dateToIso(new Date(feedDto.date)),
      lang: feedDto.lang,
      tfa: {
        title: feedDto.tfa.title,
        url: {
          desktop: feedDto.tfa.content_urls.desktop,
          mobile: feedDto.tfa.content_urls.mobile,
        },
        thumbnailUrl: feedDto.tfa.thumbnail.source,
        formattedDate: dateToIso(new Date(feedDto.tfa.timestamp)),
        views: null,
        badges: ['Featured'],
      },
      articles: [],
    };
  }
}

export const feedRepository = new FeedRepository();
