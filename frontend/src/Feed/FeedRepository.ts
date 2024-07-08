import { ApiGateway } from '../ApiGateway';
import { action, makeObservable, observable } from 'mobx';

export interface ArticulePM {
  title: string;
  url: {
    desktop: string;
    mobile: string;
  };
  thumbnailUrl: string;
  date: Date;
  views: number | null;
  description: string;
}

export interface FeedPm {
  date: Date;
  lang: string;
  tfa: Omit<ArticulePM, 'views'>;
  articles: ArticulePM[];
}

class FeedRepository {
  apiGateway: ApiGateway;

  @observable feedPm: FeedPm | null = null;
  @observable loading = true;

  constructor() {
    this.apiGateway = new ApiGateway();
    makeObservable(this);
  }

  @action
  setPm(feedPm: FeedPm) {
    this.feedPm = feedPm;
  }

  @action
  setLoading(value: boolean) {
    this.loading = value;
  }

  async getFeed(date: Date, lang: string) {
    this.setLoading(true);
    const result = await this.apiGateway.getFeed(date, lang);
    this.setLoading(false);
    // TODO handle cancel last request
    if (result.error || !result.value) {
      // TODO handle error
      throw new Error(result.error?.message ?? 'Unknown error');
    }

    const feedDto = result.value;

    this.setPm({
      date: new Date(feedDto.date),
      lang: feedDto.lang,
      tfa: {
        title: feedDto.tfa.title,
        url: {
          desktop: feedDto.tfa.content_urls.desktop,
          mobile: feedDto.tfa.content_urls.mobile,
        },
        thumbnailUrl: feedDto.tfa.thumbnail.source,
        date: new Date(feedDto.tfa.timestamp),
        description: feedDto.tfa.description,
      },
      articles: [],
    });
  }
}

export const feedRepository = new FeedRepository();
