import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedVm } from './FeedPresenter';
import { feedRepository } from './FeedRepository';
import { FeedTestHarness } from '../TestTools/FeedTestHarness';
import { GetFeedStub } from '../TestTools/stubs/get.feed.stub';

describe('FeedPresenter', () => {
  let feedTestHarness: FeedTestHarness;
  const july = new Date(2024, 6, 1);

  beforeEach(() => {
    feedTestHarness = new FeedTestHarness();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  it("it should load the feed on today's date and in english", async () => {
    const lang = 'en';
    await feedTestHarness.init(july, lang);

    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(july, 'en');
  });

  it('it should load tfa in english', async () => {
    const lang = 'en';
    const feedPresenter = await feedTestHarness.init(july, lang);

    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(july, 'en');
    expect(feedPresenter.feedVm).toBeDefined();
    const feedVm = feedPresenter.feedVm as FeedVm;

    expect(feedVm.date).toBe(july);
    expect(feedVm.lang).toBe('en');

    const tfa = feedVm.tfa;
    expect(tfa.title).toBe('Statue of Liberty 2024-07-01');
    expect(tfa.formattedDate).toBe('July 1, 2024');
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

  it('should load tfa on any date less than today in other language', async () => {
    const lang = 'es';
    const february = new Date(2024, 1, 1);
    const feedPresenter = await feedTestHarness.init(february, lang);
    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(
      february,
      'es',
    );

    expect(feedPresenter.selectedDate).toBe(february);
    expect(feedPresenter.selectedLanguage).toBe(lang);

    expect(feedPresenter.feedVm).toBeDefined();
    const feedVm = feedPresenter.feedVm as FeedVm;

    expect(feedVm.lang).toBe('es');
    expect(feedVm.tfa.title).toBe('Estatua de la Libertad 2024-02-01');
    expect(feedVm.tfa.formattedDate).toBe('1 de febrero de 2024');
  });

  it('should load tfa when date is selected', async () => {
    const lang = 'en';
    const feedPresenter = await feedTestHarness.init(july, lang);

    const february = new Date(2024, 1, 1);
    // pivot
    vi.spyOn(feedRepository.apiGateway, 'getFeed').mockResolvedValue(
      GetFeedStub(february, lang),
    );

    //  action
    await feedPresenter.onDateSelected(february);

    expect(feedPresenter.selectedDate).toBe(february);
    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(
      february,
      'en',
    );

    expect(feedPresenter.feedVm).toBeDefined();
    const feedVm = feedPresenter.feedVm as FeedVm;
    expect(feedVm.tfa.title).toBe('Statue of Liberty 2024-02-01');
    expect(feedVm.tfa.formattedDate).toBe('February 1, 2024');
  });
});
