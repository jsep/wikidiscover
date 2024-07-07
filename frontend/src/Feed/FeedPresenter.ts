// import { ApiGateway } from "../ApiGateway";
import { IsoDateString } from '../utils';
import { feedRepository } from './FeedRepository.ts';
import { action, observable } from 'mobx';

export interface ArticuleVM {
  title: string;
  url: string;
  thumbnailUrl: string;
  formattedDate: string;
  views: number | null;
  badges: string[];
}
export interface FeedVm {
  date: IsoDateString;
  lang: string;
  tfa: ArticuleVM;
  articules: ArticuleVM[];
}

export default class FeedPresenter {
  @observable selectedDate: Date;
  @observable selectedLanguage: string;

  constructor() {
    this.selectedDate = new Date();
    this.selectedLanguage = 'en';
  }

  @action
  setDate(date: Date) {
    this.selectedDate = date;
  }

  @action
  setLanguage(language: string) {
    this.selectedLanguage = language;
  }

  async load(): Promise<FeedVm> {
    const feedPm = await feedRepository.getFeed(
      this.selectedDate,
      this.selectedLanguage,
    );
    return {
      date: '2024-06-01',
      lang: 'en',
      tfa: {
        title: 'The Financial Advisor',
        url: 'https://www.thefinancialadvisor.com',
        thumbnailUrl: 'https://www.thefinancialadvisor.com/thumbnail.jpg',
        formattedDate: '2024-06-01',
        views: 1000,
        badges: ['Featured'],
      },
      articules: [],
    };
  }
}
