import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArticuleVM, FeedVm } from './FeedPresenter';
import { feedRepository } from './FeedRepository';
import { FeedTestHarness } from '../TestTools/FeedTestHarness';
import {
  GetFeedStub,
  GetFeedWithNoTFAStub,
} from '../TestTools/stubs/get.feed.stub';
import { dateToIso } from '../utils';

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
    const feedPresenter = await feedTestHarness.init(july, lang);

    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(july, 'en');
    expect(feedPresenter.currentDateFeedVm).toBeDefined();
    expect(feedPresenter.currentDateFeedVm?.lang).toBe('en');
    expect(dateToIso(feedPresenter.currentDateFeedVm?.date as Date)).toBe(
      dateToIso(july),
    );
    expect(feedPresenter.currentDateFeedVm?.featuredContentLabel).toBe(
      "Wikipedia's Featured Content 2024-07-01-en",
    );
  });

  it('it should load tfa in english', async () => {
    const lang = 'en';
    const feedPresenter = await feedTestHarness.init(july, lang);

    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(july, 'en');
    expect(feedPresenter.currentDateFeedVm).toBeDefined();
    const feedVm = feedPresenter.currentDateFeedVm as FeedVm;

    expect(dateToIso(feedVm.date)).toBe(dateToIso(july));
    expect(feedVm.lang).toBe('en');

    const tfa = feedVm.tfa as ArticuleVM;
    expect(tfa.title).toBe('Statue of Liberty 2024-07-01-en');
    expect(tfa.formattedDate).toBe('July 1, 2024');
    expect(tfa.badges).toEqual(['Featured 2024-07-01-en']);
    expect(tfa.thumbnailUrl).toEqual(
      expect.stringMatching(/upload\.wikimedia/),
    );
    expect(tfa.badges).toHaveLength(1);
    expect(tfa.badges[0]).toBe('Featured es');

    expect(tfa.url.desktop).toEqual(
      expect.stringMatching(/en\.wikipedia\.org/),
    );
    expect(tfa.url.mobile).toEqual(
      expect.stringMatching(/en\.m\.wikipedia\.org/),
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

    expect(feedPresenter.currentDateFeedVm).toBeDefined();
    const feedVm = feedPresenter.currentDateFeedVm as FeedVm;

    expect(feedVm.lang).toBe('es');
    expect(feedVm.tfa?.title).toBe('Statue of Liberty 2024-02-01-es');
    expect(feedVm.tfa?.description).toBe(
      'The Statue of Liberty is a colossal in New York Harbor. 2024-02-01-es',
    );

    expect(feedVm.tfa?.formattedDate).toBe('1 de febrero de 2024');
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

  it('should load tfa when lang is selected', async () => {
    const lang = 'en';
    const march = new Date(2024, 2, 1);
    const feedPresenter = await feedTestHarness.init(march, lang);
    const newLang = 'es';

    // pivot
    vi.spyOn(feedRepository.apiGateway, 'getFeed').mockResolvedValue(
      GetFeedStub(march, newLang),
    );

    //  action
    await feedPresenter.onLangSelected(newLang);

    expect(feedPresenter.selectedLanguage).toBe(newLang);
    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(
      march,
      newLang,
    );

    expect(feedPresenter.feedVm).toBeDefined();
    const feedVm = feedPresenter.feedVm as FeedVm;
    expect(feedVm.tfa.title).toBe('Estatua de la Libertad 2024-03-01');
    expect(feedVm.tfa.formattedDate).toBe('1 de marzo de 2024');
  });

  it('should get image as TFA if tfa is not defined', async () => {
    const feedPresenter = await feedTestHarness.loadFeedWithout(july, 'en', [
      'tfa',
    ]);

    expect(feedPresenter.feedVm).toBeDefined();
    const feedVm = feedPresenter.feedVm as FeedVm;
    expect(feedVm.tfa.title).toBe('File:Image 2024-07-01');
  });

  it('should load tfa wtih first mostRead if no image or tfa', async () => {
    const feedPresenter = await feedTestHarness.loadFeedWithout(july, 'en', [
      'tfa',
      'image',
    ]);
    expect(feedPresenter.feedVm).toBeDefined();
    const feedVm = feedPresenter.feedVm as FeedVm;
    expect(feedVm.tfa.title).toBe('Project 2025 2024-07-01');
  });

  it('should load tfa with first onThisDay if no other is available', async () => {
    const feedPresenter = await feedTestHarness.loadFeedWithout(july, 'en', [
      'tfa',
      'image',
      'mostReadArticles',
    ]);
    expect(feedPresenter.feedVm).toBeDefined();
    const feedVm = feedPresenter.feedVm as FeedVm;
    expect(feedVm.tfa.title).toBe('NASA 2024-07-01');
  });

  it('should load articles, first row should feature image, most read and on this day', async () => {
    const lang = 'en';
    const feedPresenter = await feedTestHarness.init(july, lang);
    expect(feedPresenter.feedVm).toBeDefined();

    const feedVm = feedPresenter.feedVm as FeedVm;
    expect(feedVm.articles).toHaveLength(3);
  });

  it('should load more articles with next day', async () => {
    const lang = 'en';
    const july2nd = new Date(2024, 6, 2);
    const feedPresenter = await feedTestHarness.init(july, lang);
    expect(feedPresenter.feedVm).toBeDefined();

    // pivot
    vi.spyOn(feedRepository.apiGateway, 'getFeed').mockResolvedValue(
      GetFeedStub(july2nd, 'en'),
    );

    // action
    await feedPresenter.loadMore();
    // expect(feedPresenter.isLoadingMore).toBe(true);

    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(
      july2nd,
      'en',
    );

    expect(feedPresenter.isLoadingMore).toBe(false);
    expect(feedPresenter.feedVm?.articles).toHaveLength(3);
    expect(feedPresenter.moreFeedsArticulesVm).toBeDefined();
    expect(feedPresenter.moreFeedsArticulesVm).toHaveLength(4);
    expect(feedPresenter.moreFeedsArticulesVm[0].title).toEqual(
      'Statue of Liberty 2024-07-02',
    );
    expect(feedPresenter.moreFeedsArticulesVm[3].title).toEqual(
      'NASA 2024-07-02',
    );
  });

  it('should load more articles with next day and more days', async () => {
    const lang = 'en';
    const july2nd = new Date(2024, 6, 2);
    const feedPresenter = await feedTestHarness.init(july, lang);
    expect(feedPresenter.feedVm).toBeDefined();

    // action
    await feedTestHarness.loadMore(feedPresenter, july2nd, 'en');

    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(
      july2nd,
      'en',
    );
    // safe guard
    expect(feedPresenter.moreFeedsArticulesVm).toHaveLength(4);

    const july3rd = new Date(2024, 6, 3);
    // action
    await feedTestHarness.loadMore(feedPresenter, july3rd, 'en');
    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(
      july3rd,
      'en',
    );
    expect(feedPresenter.isLoadingMore).toBe(false);
    expect(feedPresenter.moreFeedsArticulesVm).toHaveLength(8);
    expect(feedPresenter.moreFeedsArticulesVm[0].title).toEqual(
      'Statue of Liberty 2024-07-02',
    );
    expect(feedPresenter.moreFeedsArticulesVm[3].title).toEqual(
      'NASA 2024-07-02',
    );
    expect(feedPresenter.moreFeedsArticulesVm[4].title).toEqual(
      'Statue of Liberty 2024-07-03',
    );
    expect(feedPresenter.moreFeedsArticulesVm[7].title).toEqual(
      'NASA 2024-07-03',
    );
  });

  it('should open a articule', async () => {
    const lang = 'en';
    const feedPresenter = await feedTestHarness.init(july, lang);
    expect(feedPresenter.feedVm).toBeDefined();

    await feedTestHarness.openArticle(feedPresenter.feedVm.tfa);
    expect(feedPresenter.feedVm?.tfa?.isRead).toEqual(true);
    expect(window.open).toHaveBeenCalledWith(
      feedPresenter.feedVm.tfa.url.desktop,
      '_blank',
    );

    await feedTestHarness.openArticle(feedPresenter.feedVm?.articles[0]);
    expect(feedPresenter.feedVm?.articles[0].isRead).toEqual(true);
    expect(window.open).toHaveBeenCalledWith(
      feedPresenter.feedVm.articles[0].url.desktop,
      '_blank',
    );
  });

  it('should save the article as read', async () => {
    const feedPresenter = await feedTestHarness.init(july, 'en');
    expect(feedPresenter.feedVm?.tfa?.isRead).toEqual(false);

    // feedRepository.apiGateway.markArticleAsRead = vi.fn();

    await feedTestHarness.openArticle(feedPresenter.feedVm.tfa);

    expect(feedPresenter.feedVm?.tfa?.isRead).toEqual(true);

    // expect(feedRepository.apiGateway.markArticleAsRead).toHaveBeenCalledWith(
    //   feedPresenter.feedVm?.tfa?.id,
    // );

    await feedPresenter.load();
    expect(feedPresenter.feedVm?.tfa?.isRead).toEqual(true);
    expect(feedPresenter.feedVm.articles[0].isRead).toEqual(false);
  });
});
