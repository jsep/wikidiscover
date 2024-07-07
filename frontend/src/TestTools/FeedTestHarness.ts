import { feedRepository } from '../Feed/FeedRepository';
import { vi } from 'vitest';
import FeedPresenter from '../Feed/FeedPresenter.ts';
import { GetFeedStub } from './stubs/get.feed.stub.ts';

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
}
