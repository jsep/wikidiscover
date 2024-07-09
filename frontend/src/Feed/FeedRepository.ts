import {
  ApiGateway,
  FeedDto,
  ImageDTO,
  MostReadArticleDTO,
  OnThisDayDTO,
} from '../ApiGateway';
import { action, makeObservable, observable } from 'mobx';

export interface ArticulePM {
  type: 'tfa' | 'image' | 'most-read' | 'on-this-day';
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
  tfa: ArticulePM | null;
  articles: ArticulePM[];
}

class FeedRepository {
  apiGateway: ApiGateway;

  @observable currentFeedPm: FeedPm | null = null;
  @observable loadingCurrentFeed = true;
  @observable loadingMoreFeed = false;

  @observable morefeedArticles: ArticulePM[] = observable.array([]);

  constructor() {
    this.apiGateway = new ApiGateway();
    makeObservable(this);
  }

  @action
  setCurrentFeedPm(feedPm: FeedPm) {
    this.currentFeedPm = feedPm;
  }

  @action
  setLoadingCurrentFeed(value: boolean) {
    this.loadingCurrentFeed = value;
  }

  @action
  setLoadingMoreFeed(value: boolean) {
    this.loadingMoreFeed = value;
  }

  async getMoreFeed(date: Date, lang: string) {
    this.setLoadingMoreFeed(true);
    const { error, value: feedDto } = await this.apiGateway.getFeed(date, lang);
    if (error) {
      // TODO handle error loading more
      throw new Error(error.message ?? 'Unknown error');
    }

    // wait 1 second
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const feedPm = this.mapToFeedPm(feedDto);
    this.addMoreFeed(feedPm);
    this.setLoadingMoreFeed(false);
  }

  @action
  addMoreFeed(feedPm: FeedPm) {
    if (feedPm.tfa) {
      feedPm.articles.unshift(feedPm.tfa);
      feedPm.tfa = null;
    }

    this.morefeedArticles.push(...feedPm.articles);
  }

  async getFeed(date: Date, lang: string) {
    this.setLoadingCurrentFeed(true);
    this.morefeedArticles = [];
    const { error, value: feedDto } = await this.apiGateway.getFeed(date, lang);
    this.setLoadingCurrentFeed(false);
    // TODO cancel last request
    if (error) {
      // TODO handle error
      throw new Error(error.message ?? 'Unknown error');
    }

    // TODO fix date issues, make sure to use UTC
    this.setCurrentFeedPm(this.mapToFeedPm(feedDto));
  }

  mapToFeedPm(feedDto: FeedDto): FeedPm {
    return {
      date: new Date(feedDto.data.date),
      lang: feedDto.data.lang,
      tfa: this.getTfaArticule(feedDto),
      articles: this.getArticlesFromFeed(feedDto),
    };
  }

  useImageAsTFA(feedDto: FeedDto) {
    return !feedDto.data.tfa && feedDto.data.image !== null;
  }

  getArticlesFromFeed(feedDto: FeedDto) {
    const articules: ArticulePM[] = [];
    const data = feedDto.data;
    if (data.image && !this.useImageAsTFA(feedDto)) {
      articules.push(this.mapImageToArticule(data.image));
    }
    // if (data.onThisDay && data.onThisDay.length > 0) {
    //   const first = data.onThisDay.shift() as OnThisDayDTO;
    //   articules.push(this.mapOnThisDayToArticule(first));
    // }

    // if (data.mostReadArticles && data.mostReadArticles.length > 0) {
    //   const first = data.mostReadArticles.shift() as MostReadArticleDTO;
    //   articules.push(this.mapMostReadToArticule(first));
    // }

    const onThisDayArticles = data.onThisDay.map(this.mapOnThisDayToArticule);
    const mostReadArticles = data.mostReadArticles.map(
      this.mapMostReadToArticule,
    );

    // Interleave articles
    while (onThisDayArticles.length > 0 || mostReadArticles.length > 0) {
      if (mostReadArticles.length > 0) {
        articules.push(mostReadArticles.shift() as ArticulePM);
      }
      if (onThisDayArticles.length > 0) {
        articules.push(onThisDayArticles.shift() as ArticulePM);
      }
    }

    // Add 3, from on this day,
    // Add 3 from mostRead

    return articules;
  }
  mapOnThisDayToArticule(first: OnThisDayDTO): ArticulePM {
    return {
      type: 'on-this-day',
      title: first.title,
      url: {
        desktop: first.urls.desktop,
        mobile: first.urls.mobile,
      },
      thumbnailUrl: first.thumbnail?.source ?? '/placeholder.svg',
      date: new Date(first.timestamp as string),
      description: first.description,
      views: null,
    };
  }

  getTfaArticule(feedDto: FeedDto): ArticulePM {
    const data = feedDto.data;
    if (data.tfa) {
      return {
        type: 'tfa',
        title: data.tfa.title,
        url: {
          desktop: data.tfa.urls.desktop,
          mobile: data.tfa.urls.mobile,
        },
        thumbnailUrl: data.tfa.thumbnail?.source ?? '/placeholder.svg',
        date: new Date(data.tfa.timestamp as string),
        description: data.tfa.description,
        views: null,
      };
    }
    if (data.image) {
      return this.mapImageToArticule(data.image);
    }
    if (data.mostReadArticles && data.mostReadArticles.length > 0) {
      const first = data.mostReadArticles.shift() as MostReadArticleDTO;
      return this.mapMostReadToArticule(first);
    }
    if (data.onThisDay && data.onThisDay.length > 0) {
      const first = data.onThisDay.shift() as OnThisDayDTO;
      return this.mapOnThisDayToArticule(first);
    }
    throw new Error('Failed to load TFA');
  }

  mapImageToArticule(image: ImageDTO): ArticulePM {
    return {
      type: 'image',
      title: image.title,
      url: {
        desktop: image.urls.desktop,
        mobile: image.urls.mobile,
      },
      thumbnailUrl: image.thumbnail?.source ?? '/placeholder.svg',
      date: image.timestamp ? new Date(image.timestamp) : new Date(),
      description: image.description,
      views: null,
    };
  }

  mapMostReadToArticule(mostRead: MostReadArticleDTO): ArticulePM {
    return {
      type: 'most-read',
      title: mostRead.title,
      url: {
        desktop: mostRead.urls.desktop,
        mobile: mostRead.urls.mobile,
      },
      thumbnailUrl: mostRead.thumbnail?.source ?? '/placeholder.svg',
      date: new Date(mostRead.timestamp as string),
      description: mostRead.description,
      views: mostRead.views ?? null,
    };
  }
}

export const feedRepository = new FeedRepository();
