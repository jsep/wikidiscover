import { dateToFriendly, dateToIso } from '../utils.ts';
import { ArticulePM, FeedPM, feedRepository } from './FeedRepository.ts';
import { action, computed, makeObservable, observable } from 'mobx';

export interface ArticuleVM {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
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
  featuredContentLabel: string;
  tfa: ArticuleVM | null;
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

  openArticle(article: ArticuleVM) {
    console.log('opening article', { article });
    feedRepository.markArticleAsRead(article.id);
    window.open(article.url.desktop, '_blank');
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
  get moreFeedsVM(): FeedVm[] {
    return feedRepository.moreFeedsPm.map((feedPm) => this.mapToFeedVm(feedPm));
  }

  @computed
  get currentDateFeedVm(): FeedVm | null {
    let feedPm = feedRepository.currentDateFeedPm;
    // TODO handle errors
    if (!feedPm) {
      return null;
    }

    return this.mapToFeedVm(feedPm);
  }

  mapToFeedVm(feedPm: FeedPM): FeedVm {
    const tfa = feedPm.articles[0] || null;
    const articles = feedPm.articles.filter((_, index) => index > 0);

    return {
      date: new Date(feedPm.date),
      lang: feedPm.lang,
      featuredContentLabel: feedPm.featuredContentLabel,
      tfa: this.mapToArticuleVm(tfa, feedPm),
      articles: articles.map((article) =>
        this.mapToArticuleVm(article, feedPm),
      ),
    };
  }

  emptyFeedVm(feedPm: FeedPM): FeedVm {
    return {
      date: new Date(feedPm.date),
      lang: feedPm.lang,
      tfa: null,
      articles: [],
    };
  }

  mapToArticuleVm(article: ArticulePM, feedPm: FeedPM): ArticuleVM {
    return {
      id: article.id,
      title: article.title,
      description: article.description,
      isRead: article.isRead,
      url: {
        desktop: article.url.desktop,
        mobile: article.url.mobile,
      },
      thumbnailUrl: article.thumbnailUrl,
      formattedDate: dateToFriendly(article.date, this.selectedLanguage),
      views: article.views,
      badges: this.articuleBadges(article, feedPm),
    };
  }

  mapTFAToArticuleVm(tfa: FeedPM['tfa']): ArticuleVM | null {
    if (!tfa) {
      return null;
    }

    return {
      id: tfa.id,
      isRead: tfa.isRead,
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

  articuleBadges(article: ArticulePM, feedPm: FeedPM) {
    return (
      feedPm.badges
        .filter((badge) => badge.type === article.type)
        // TODO change to badge.label
        .map((badge) => badge.badge)
    );
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
