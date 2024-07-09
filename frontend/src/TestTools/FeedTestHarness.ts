import { ArticulePM, feedRepository } from '../Feed/FeedRepository';
import { vi } from 'vitest';
import FeedPresenter, { ArticuleVM } from '../Feed/FeedPresenter.ts';
import {
  GetFeedStub,
  GetFeedWithNoTFAStub as GetFeedWithOut,
} from './stubs/get.feed.stub.ts';
import { FeedDto } from '../ApiGateway.ts';

export class FeedTestHarness {
  async init(date: Date, lang: string) {
    global.window = { open: vi.fn() };
    global.localStorage = new FakeLocalStorage();

    vi.spyOn(feedRepository.apiGateway, 'getFeed').mockResolvedValue(
      GetFeedStub(date, lang),
    );

    vi.spyOn(feedRepository.apiGateway, 'markArticleAsRead');

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

  async loadMore(presenter: FeedPresenter, date: Date, lang: string) {
    vi.spyOn(feedRepository.apiGateway, 'getFeed').mockResolvedValue(
      GetFeedStub(date, lang),
    );
    await presenter.loadMore();
  }

  async openArticle(article: ArticulePM) {
    await feedRepository.openArticle(article);
  }
}
class FakeLocalStorage {
  values = new Map<string, string>();
  getItem = (key: string) => this.values.get(key);
  setItem = (key: string, value: string) => this.values.set(key, value);
}
