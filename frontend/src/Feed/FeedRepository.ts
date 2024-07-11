import {
  ApiGateway,
  FeedDtoResponse,
  MostReadArticleDTO,
  NewsDTO,
  OnThisDayDTO,
  WikipediaResponseDto as WikipediaResponseDTO,
} from '../ApiGateway';
import { action, makeObservable, observable } from 'mobx';
import { Result, attempt, ok } from '../utils';
import type { ArticuleVM } from './FeedPresenter';

export interface ArticulePM {
  id: string;
  isRead: boolean;
  type: 'tfa' | 'image' | 'mostread' | 'onthisday' | 'news';
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

export type Badge = {
  type: 'tfa' | 'image' | 'mostread' | 'onthisday';
  badge: string;
};

export interface FeedPM {
  date: Date;
  lang: string;
  badges: Badge[];
  featuredContentLabel: string;
  articles: ArticulePM[];
}

class FeedRepository {
  apiGateway: ApiGateway;

  @observable currentDateFeedPm: FeedPM | null = null;
  @observable moreFeedsPm: FeedPM[] = [];
  @observable loadingCurrentFeed = true;
  @observable loadingMoreFeed = false;

  constructor() {
    this.apiGateway = new ApiGateway();
    makeObservable(this);
  }

  @action
  setCurrentFeedPm(feedPm: FeedPM) {
    this.currentDateFeedPm = feedPm;
  }

  @action
  setLoadingCurrentFeed(value: boolean) {
    this.loadingCurrentFeed = value;
  }

  @action
  setLoadingMoreFeed(value: boolean) {
    this.loadingMoreFeed = value;
  }

  @action
  async openArticle(article: ArticuleVM) {
    await this.markArticleAsRead(article.id);

    window.open(article.url.desktop, '_blank');
  }

  @action
  async markArticleAsRead(id: string) {
    let article: ArticulePM | undefined = this.currentDateFeedPm?.articles.find(
      (article) => article.id === id,
    );

    if (!article) {
      this.moreFeedsPm.forEach((feed) => {
        article = feed.articles.find((article) => article.id === id);
      });
    }

    if (article) {
      article.isRead = true;
    }

    await this.apiGateway.markArticleAsRead(id);
  }

  async getMoreFeed(date: Date, lang: string) {
    if (this.loadingMoreFeed) {
      return;
    }

    this.setLoadingMoreFeed(true);
    const { error, value: feedDto } = await this.apiGateway.getFeed(date, lang);
    if (error) {
      // TODO handle error loading more
      throw new Error(error.message ?? 'Unknown error');
    }

    const feedPm = this.mapToFeedPm(feedDto);
    this.addMoreFeed(feedPm);
    this.setLoadingMoreFeed(false);
  }

  @action
  addMoreFeed(feedPm: FeedPM) {
    this.moreFeedsPm.push(feedPm);
  }

  async getFeed(date: Date, lang: string) {
    this.setLoadingCurrentFeed(true);
    this.moreFeedsPm = [];
    const { error, value: feedDto } = await this.apiGateway.getFeed(date, lang);
    this.setLoadingCurrentFeed(false);
    // TODO cancel last request
    if (error) {
      // TODO handle error
      throw new Error(error.message ?? 'Unknown error');
    }

    // TODO fix date issues, make sure to use UTC
    const feedPm = this.mapToFeedPm(feedDto);
    this.setCurrentFeedPm(feedPm);
  }

  mapToFeedPm = (feedDto: FeedDtoResponse): FeedPM => ({
    date: new Date(feedDto.value.date),
    lang: feedDto.value.lang,
    featuredContentLabel: feedDto.value.featureContentLabel,
    badges: feedDto.value.badges.map((badge) => ({
      type: badge.type as Badge['type'],
      badge: badge.badge,
    })),

    articles: this.getArticlesFromFeed(feedDto),
  });

  getArticlesFromFeed(feedDto: FeedDtoResponse) {
    const articules: ArticulePM[] = [];
    const wikipediaResponseDTO = feedDto.value.wikipediaResponse;

    const tfa = this.mapTfaToArticule(wikipediaResponseDTO);
    if (tfa.value) {
      articules.push(tfa.value);
    }

    const image = this.mapImageToArticule(feedDto);
    if (image.value) {
      articules.push(image.value);
    }

    const mostReadArticlesResult =
      this.mapMostReadToArticules(wikipediaResponseDTO);
    if (
      mostReadArticlesResult.value &&
      mostReadArticlesResult.value.length > 0
    ) {
      const first = mostReadArticlesResult.value.shift() as ArticulePM;
      articules.push(first);
    }

    const onThisDayArticlesResult = this.mapOnThisDayToArticules(feedDto);
    if (
      onThisDayArticlesResult.value &&
      onThisDayArticlesResult.value.length > 0
    ) {
      const first = onThisDayArticlesResult.value.shift() as ArticulePM;
      articules.push(first);
    }
    const newsArticlesResult = this.mapNewsToArticules(feedDto);

    const onThisDayArticles = onThisDayArticlesResult.value || [];
    const mostReadArticles = mostReadArticlesResult.value || [];
    const newsArticles = newsArticlesResult.value || [];

    // Interleave articles

    while (
      onThisDayArticles.length > 0 ||
      mostReadArticles.length > 0 ||
      newsArticles.length > 0
    ) {
      if (mostReadArticles.length > 0) {
        articules.push(mostReadArticles.shift() as ArticulePM);
      }
      if (onThisDayArticles.length > 0) {
        articules.push(onThisDayArticles.shift() as ArticulePM);
      }
      if (newsArticles.length > 0) {
        articules.push(newsArticles.shift() as ArticulePM);
      }
    }

    return articules;
  }

  private mapOnThisDayToArticules(
    feed: FeedDtoResponse,
  ): Result<ArticulePM[], Error> {
    const response = feed?.value?.wikipediaResponse;
    if (!response?.onthisday) {
      return {
        error: new Error('Missing onthisday in response'),
        value: null,
      };
    }

    const date = new Date(feed.value.date);
    const result = attempt<ArticulePM[]>(() => {
      return response.onthisday
        .map(this.mapOnThisDayToArticle(date))
        .map((result) => result.value)
        .filter((value): value is ArticulePM => value !== null);
    });

    if (result.error) {
      console.error('Failed to get onthisday.', {
        error: result.error,
        feed,
      });
      return ok([]);
    }

    return result;
  }

  private mapOnThisDayToArticle(date: Date) {
    return (onThisDay: OnThisDayDTO): Result<ArticulePM, Error> => {
      const article = onThisDay.pages[0];
      const result = attempt<ArticulePM>(() => ({
        id: article.pageid + '',
        title: article.titles.normalized,
        description: onThisDay.text,
        isRead: this.apiGateway.isArticleRead(article.pageid + ''),
        type: 'onthisday',
        date: new Date(onThisDay.year, date.getUTCMonth(), date.getUTCDate()),
        views: null,
        url: {
          desktop: article.content_urls.desktop.page,
          mobile: article.content_urls.mobile.page,
        },
        thumbnailUrl: article?.thumbnail?.source ?? '/placeholder.svg',
      }));
      if (result.error) {
        console.error('Failed to get onthisday.', {
          error: result.error,
          article,
        });
      }
      return result;
    };
  }

  private mapTfaToArticule(
    response: WikipediaResponseDTO,
  ): Result<ArticulePM, Error> {
    if (!response.tfa) {
      return {
        // this is an expected error, not all responses contain TFA
        error: new Error('Missing TFA in response'),
        value: null,
      };
    }
    const result = attempt<ArticulePM>(() => {
      return {
        id: response.tfa.pageid + '',
        isRead: this.apiGateway.isArticleRead(response.tfa.pageid + ''),
        type: 'tfa',
        title: response.tfa.normalizedtitle,
        description: response.tfa.extract,
        date: new Date(response.tfa.timestamp),
        url: {
          desktop: response.tfa.content_urls.desktop.page,
          mobile: response.tfa.content_urls.mobile.page,
        },
        thumbnailUrl: response.tfa.thumbnail.source,
        views: null,
      };
    });

    if (result.error) {
      console.error('Failed to parse TFA', {
        tfa: response.tfa,
        error: result.error,
      });

      return {
        error: new Error('Failed to parse TFA. Details: ' + result.error),
        value: null,
      };
    }

    return result;
  }

  private mapImageToArticule(
    feedDto: FeedDtoResponse,
  ): Result<ArticulePM, Error> {
    const response = feedDto?.value?.wikipediaResponse;
    if (!response.image) {
      return {
        error: new Error('Missing image in response'),
        value: null,
      };
    }

    const result = attempt<ArticulePM>(() => {
      return {
        id: response.image.wb_entity_id,
        title: response.image.title,
        isRead: this.apiGateway.isArticleRead(response.image.wb_entity_id),
        type: 'image',
        description: response.image.description.text,
        url: {
          desktop: response.image.file_page,
          mobile: response.image.file_page,
        },
        thumbnailUrl: response.image.thumbnail.source,
        date: new Date(feedDto.value.date),
        views: null,
      };
    });

    if (result.error) {
      console.error('Failed to parse image. Details: ' + result.error);
      return {
        error: new Error('Failed to parse image. Details: ' + result.error),
        value: null,
      };
    }

    return result;
  }

  private mapNewsToArticules(
    feed: FeedDtoResponse,
  ): Result<ArticulePM[], Error> {
    const response = feed?.value?.wikipediaResponse;
    if (!response.news) {
      return {
        error: new Error('Missing news in response'),
        value: null,
      };
    }

    const date = new Date(feed.value.date);

    const result = attempt<ArticulePM[]>(() => {
      return response.news
        .map((article) => this.mapNewsToArticle(article, date))
        .map((result) => result.value)
        .filter((value): value is ArticulePM => value !== null);
    });

    if (result.error) {
      console.error('Failed to get mostread. Details: ' + result.error);
      return ok([]);
    }

    return result;
  }

  private mapNewsToArticle(
    article: NewsDTO,
    date: Date,
  ): Result<ArticulePM, Error> {
    const result = attempt<ArticulePM>(() => {
      return {
        id: article.links[0].pageid + '',
        type: 'news',
        title: article.links[0].normalizedtitle,
        description: article.links[0].extract,
        isRead: this.apiGateway.isArticleRead(article.links[0].pageid + ''),
        url: {
          desktop: article.links[0].content_urls.desktop.page,
          mobile: article.links[0].content_urls.mobile.page,
        },
        thumbnailUrl: article.links[0]?.thumbnail?.source ?? '/placeholder.svg',
        date: date,
        views: null,
      };
    });

    if (result.error) {
      console.error('Failed to get news article. Details: ' + result.error);
      return {
        error: new Error(
          'Failed to get news article. Details: ' + result.error,
        ),
        value: null,
      };
    }

    return result;
  }

  private mapMostReadToArticules(
    response: WikipediaResponseDTO,
  ): Result<ArticulePM[], Error> {
    if (!response.mostread) {
      return {
        error: new Error('Missing mostread in response'),
        value: null,
      };
    }

    const result = attempt<ArticulePM[]>(() => {
      return response.mostread.articles
        .map(this.mapMostReadToArticle)
        .map((result) => result.value)
        .filter((value): value is ArticulePM => value !== null);
    });

    if (result.error) {
      console.error('Failed to get mostread. Details: ' + result.error);
      return ok([]);
    }

    return result;
  }

  private mapMostReadToArticle = (
    article: MostReadArticleDTO,
  ): Result<ArticulePM, Error> => {
    const result = attempt<ArticulePM>(() => ({
      id: article.pageid + '',
      title: article.titles.normalized,
      description: article.extract || '',
      isRead: this.apiGateway.isArticleRead(article.pageid + ''),
      type: 'mostread',
      url: {
        desktop: article.content_urls.desktop.page,
        mobile: article.content_urls.mobile.page,
      },
      views: article.views,
      rank: article.rank,
      date: new Date(article.timestamp),
      thumbnailUrl: !article.thumbnail
        ? '/placeholder.svg'
        : article.thumbnail.source,
    }));
    if (result.error) {
      console.error('Failed to get most read article. ', {
        error: result.error,
        article,
      });

      return {
        error: new Error(
          'Failed to get most read article. Details: ' + result.error,
        ),
        value: null,
      };
    }
    return result;
  };
}

export const feedRepository = new FeedRepository();
