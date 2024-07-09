import { feedRepository } from '../Feed/FeedRepository';
import { vi } from 'vitest';
import FeedPresenter from '../Feed/FeedPresenter.ts';
import {
  GetFeedStub,
  GetFeedWithNoTFAStub as GetFeedWithOut,
} from './stubs/get.feed.stub.ts';
import { FeedDto } from '../ApiGateway.ts';

export class FeedTestHarness {
  async init(date: Date, lang: string) {
    vi.spyOn(feedRepository.apiGateway, 'getFeed').mockResolvedValue(
      GetFeedStub(date, lang),
    );
    const feedPresenter = new FeedPresenter();
    feedPresenter.setDate(date);
    feedPresenter.setLanguage(lang);

    await feedPresenter.load();

    return feedPresenter;
  }

  async loadFeedWithout(
    date: Date,
    lang: string,
    without: Array<keyof FeedDto['data']>,
  ) {
    vi.spyOn(feedRepository.apiGateway, 'getFeed').mockResolvedValue(
      GetFeedWithOut(date, lang, without),
    );

    const feedPresenter = new FeedPresenter();
    feedPresenter.setDate(date);
    feedPresenter.setLanguage(lang);
    await feedPresenter.load();

    return feedPresenter;
  }
}
