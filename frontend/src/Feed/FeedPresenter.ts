import { dateToFriendly, dateToIso } from '../utils.ts';
import { ArticulePM, FeedPm, feedRepository } from './FeedRepository.ts';
import { action, computed, makeObservable, observable } from 'mobx';

export interface ArticuleVM {
  title: string;
  description: string;
  url: {
    desktop: string;
    mobile: string;
  };
  thumbnailUrl: string;
  formattedDate: string;
  views: number | null;
  badges: string[];
}

export interface FeedVm {
  date: Date;
  lang: string;
  tfa: Omit<ArticuleVM, 'views'> | null;
  articles: ArticuleVM[];
}

export default class FeedPresenter {
  @observable selectedDate: Date;
  @observable selectedLanguage: string;
  loadMoreDate: Date | null = null;

  constructor() {
    makeObservable(this);
    this.selectedDate = new Date();
    this.selectedLanguage = 'en';
  }

  @computed
  get selectedDateString() {
    return dateToIso(this.selectedDate);
  }

  @computed
  get isLoading() {
    return feedRepository.loadingCurrentFeed;
  }

  async onDateSelected(newDate: Date) {
    this.setDate(newDate);
    await this.load();
  }

  async onLangSelected(lang: string) {
    this.setLanguage(lang);
    await this.load();
  }

  @computed
  get isLoadingMore() {
    return feedRepository.loadingMoreFeed;
  }

  async loadMore() {
    const date = this.loadMoreDate ?? new Date(this.selectedDate);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    this.loadMoreDate = nextDate;

    await feedRepository.getMoreFeed(nextDate, this.selectedLanguage);
  }

  @computed
  get moreFeedsArticulesVm(): ArticuleVM[] {
    return feedRepository.morefeedArticles.map((article) =>
      this.mapToArticuleVm(article),
    );
  }

  @computed
  get feedVm(): FeedVm | null {
    let feedPm = feedRepository.currentFeedPm;
    // TODO handle errors
    if (!feedPm) {
      return null;
    }
    let tfa = feedPm.tfa;
    // first row should feature image, most read and on this day

    return {
      date: this.selectedDate,
      lang: this.selectedLanguage,
      tfa: this.mapTFAToArticuleVm(tfa),
      articles: feedPm.articles.map((article) => this.mapToArticuleVm(article)),
    };
  }

  mapToFeedVm(feedPm: FeedPm): FeedVm {
    return {
      date: feedPm.date,
      lang: feedPm.lang,
      tfa: this.mapTFAToArticuleVm(feedPm.tfa),
      articles: feedPm.articles.map((article) => this.mapToArticuleVm(article)),
    };
  }

  mapToArticuleVm(article: ArticulePM): ArticuleVM {
    return {
      title: article.title,
      description: article.description,
      url: {
        desktop: article.url.desktop,
        mobile: article.url.mobile,
      },
      thumbnailUrl: article.thumbnailUrl,
      formattedDate: dateToFriendly(article.date, this.selectedLanguage),
      views: article.views,
      badges: this.articuleBadges(article),
    };
  }

  mapTFAToArticuleVm(tfa: FeedPm['tfa']): ArticuleVM | null {
    if (!tfa) {
      return null;
    }

    return {
      title: tfa.title,
      url: {
        desktop: tfa.url.desktop,
        mobile: tfa.url.mobile,
      },
      formattedDate: dateToFriendly(tfa.date, this.selectedLanguage),
      badges: this.articuleBadges(tfa),
      description: tfa.description,
      thumbnailUrl: tfa.thumbnailUrl,
      views: tfa.views,
    };
  }

  articuleBadges(article: ArticulePM) {
    switch (article.type) {
      case 'tfa':
        return ['Featured'];
      case 'image':
        return ['Image'];
      case 'most-read':
        return ['Most Read'];
      case 'on-this-day':
        return ['On This Day'];
      default:
        return [];
    }
  }

  @action
  setDate(date: Date) {
    this.selectedDate = date;
  }

  @action
  setLanguage(language: string) {
    this.selectedLanguage = language;
  }

  async load() {
    await feedRepository.getFeed(this.selectedDate, this.selectedLanguage);
  }
}
