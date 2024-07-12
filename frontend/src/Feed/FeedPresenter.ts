import { dateToFriendly, dateToIso } from '../utils.ts';
import { ArticulePM, FeedPM, feedRepository } from './FeedRepository.ts';
import { action, computed, makeObservable, observable } from 'mobx';
import { languages } from './languages.ts';

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
  views: string | null;
  badges: string[];
}

export interface FeedVM {
  date: Date;
  lang: string;
  formattedDate: string;
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

  @computed get showErrorScreen() {
    return feedRepository.showErrorScreen;
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
    this.loadMoreDate = null;
    await this.load();
  }

  openArticle(article: ArticuleVM) {
    feedRepository.markArticleAsRead(article.id);
    window.open(article.url.desktop, '_blank');
  }

  async onLangSelected(lang: string) {
    this.setLanguage(lang);
    this.loadMoreDate = null;
    await this.load();
  }

  @computed
  get languages() {
    return languages;
  }

  @computed
  get isLoadingMore() {
    return feedRepository.loadingMoreFeed;
  }

  async loadMore() {
    if (this.isLoadingMore || this.isLoading) {
      return;
    }

    const date = this.loadMoreDate ?? new Date(this.selectedDate);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    this.loadMoreDate = nextDate;

    await feedRepository.getMoreFeed(nextDate, this.selectedLanguage);
  }

  @computed
  get moreFeedsVM(): FeedVM[] {
    return feedRepository.moreFeedsPm.map((feedPm) => this.mapToFeedVm(feedPm));
  }

  @computed
  get currentDateFeedVm(): FeedVM {
    let feedPm = feedRepository.currentDateFeedPm;
    if (!feedPm) {
      return this.emptyFeedVm();
    }

    const feedVm = this.mapToFeedVm(feedPm);
    return feedVm;
  }

  mapToFeedVm(feedPm: FeedPM): FeedVM {
    const tfa = feedPm.articles[0] || null;
    const articles = feedPm.articles.filter((_, index) => index > 0);
    const date = new Date(feedPm.date);

    return {
      date: date,
      formattedDate: dateToFriendly(date, feedPm.lang),
      lang: feedPm.lang,
      featuredContentLabel: feedPm.featuredContentLabel,
      tfa: this.mapToArticuleVm(tfa, feedPm),
      articles: articles.map((article) =>
        this.mapToArticuleVm(article, feedPm),
      ),
    };
  }

  emptyFeedVm(): FeedVM {
    return {
      date: new Date(),
      lang: 'en',
      formattedDate: '',
      featuredContentLabel: 'Featured',
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
      views: article.views?.toLocaleString(feedPm.lang) ?? null,
      badges: this.articuleBadges(article, feedPm),
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
    this.loadMoreDate = null;
  }

  @action
  setLanguage(language: string) {
    this.selectedLanguage = language;
  }

  async load() {
    await feedRepository.getFeed(this.selectedDate, this.selectedLanguage);
  }
}
