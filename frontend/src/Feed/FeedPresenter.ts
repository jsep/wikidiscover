import { dateToFriendly, dateToIso } from '../utils.ts';
import { feedRepository } from './FeedRepository.ts';
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
  tfa: Omit<ArticuleVM, 'views'>;
  articules: ArticuleVM[];
}

export default class FeedPresenter {
  @observable selectedDate: Date;
  @observable selectedLanguage: string;

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
    return feedRepository.loading;
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
  get feedVm(): FeedVm | null {
    let feedPm = feedRepository.feedPm;
    if (!feedPm) {
      return null;
    }
    let tfa = feedPm.tfa;
    return {
      date: this.selectedDate,
      lang: this.selectedLanguage,
      tfa: {
        title: tfa.title,
        url: {
          desktop: tfa.url.desktop,
          mobile: tfa.url.mobile,
        },
        formattedDate: dateToFriendly(tfa.date, this.selectedLanguage),
        badges: ['Featured'],
        description: tfa.description,
        thumbnailUrl: tfa.thumbnailUrl,
      },
      articules: [],
    };
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
