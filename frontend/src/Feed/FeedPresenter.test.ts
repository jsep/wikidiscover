import { beforeEach, describe, expect, it } from 'vitest';
import { FeedVm } from './FeedPresenter';
import { feedRepository } from './FeedRepository';
import { FeedTestHarness } from '../TestTools/FeedTestHarness';

describe('FeedPresenter', () => {
  let feedTestHarness: FeedTestHarness;
  const today = new Date();

  beforeEach(() => {
    feedTestHarness = new FeedTestHarness();
  });

  it("it should load the feed on today's date and in english", async () => {
    const lang = 'en';
    await feedTestHarness.init(today, lang);

    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(today, 'en');
  });
  it('it should load tfa in english', async () => {
    const lang = 'en';
    const feedPresenter = await feedTestHarness.init(today, lang);

    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(today, 'en');
    expect(feedPresenter.feedVm).toBeDefined();
    const feedVm: FeedVm = feedPresenter.feedVm as FeedVm;

    expect(feedVm.date).toBe(today);
    expect(feedVm.lang).toBe('en');

    const tfa = feedVm.tfa;
    expect(tfa.title).toBe('Statue of Liberty');
    expect(tfa.formattedDate).toBe('July 6, 2024');
    expect(tfa.badges).toEqual(['Featured']);
    expect(tfa.thumbnailUrl).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Front_view_of_Statue_of_Liberty_with_pedestal_and_base_2024.jpg/640px-Front_view_of_Statue_of_Liberty_with_pedestal_and_base_2024.jpg',
    );
    expect(tfa.url.desktop).toBe(
      'https://en.wikipedia.org/wiki/Statue_of_Liberty',
    );
    expect(tfa.url.mobile).toBe(
      'https://en.m.wikipedia.org/wiki/Statue_of_Liberty',
    );
  });
});
