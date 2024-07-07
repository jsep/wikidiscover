import { describe, it, expect, vi, beforeEach } from 'vitest';
import FeedPresenter from './FeedPresenter';
import { feedRepository } from './FeedRepository';
import { dateToIso } from '../utils';
import { ok } from '../ApiGateway';
import { FeedTestHarness } from '../TestTools/FeedTestHarness';

describe('FeedPresenter', () => {
  let feedTestHarness: FeedTestHarness;
  beforeEach(() => {
    feedTestHarness = new FeedTestHarness();
  });
  it("it should load the feed on today's date and in english", async () => {
    const today = new Date();
    const lang = 'en';
    const feedPresenter = await feedTestHarness.init(today, lang);

    expect(feedRepository.apiGateway.getFeed).toHaveBeenCalledWith(today, 'en');
  });
});
