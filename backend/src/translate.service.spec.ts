import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { TranslateService } from './translate.service';
import {
  WikipediaService,
  WikipediaFeaturedContentResponse,
} from './wikipedia.service';
import { ConfigModule } from '@nestjs/config';
import { PostTranslate } from './stubs/post.translate';
import {
  GetFeaturedContent as GetWikipediaFeatured,
  GetFeaturedContentWithout,
} from './stubs/get.featured';

describe('TranslateService', () => {
  let translateService: TranslateService;
  let enResponse: WikipediaFeaturedContentResponse;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [],
      providers: [TranslateService],
    }).compile();

    translateService = app.get<TranslateService>(TranslateService);
    enResponse = GetWikipediaFeatured();

    jest
      .spyOn(translateService, 'translate')
      .mockImplementation(async ({ text, from, to }) => {
        return {
          error: null,
          value: PostTranslate(text, to).translatedText,
        };
      });
  });

  it('should translate text', async () => {
    // reset the mock
    jest.restoreAllMocks();
    fetchMock.mockResponse(JSON.stringify(PostTranslate('text', 'es')));

    const result = await translateService.translate({
      text: 'text',
      from: 'en',
      to: 'es',
    });

    expect(result.error).toBeNull();
    expect(result.value).toEqual('text-es');
  });

  it('should not translate tfa if available', async () => {
    const targetLangResponse = GetWikipediaFeatured();
    const result = await translateService.translateTfa(
      targetLangResponse,
      enResponse,
      'es',
    );

    expect(result.error).toBeNull();
    expect(result.value).toEqual(targetLangResponse.tfa);
  });

  it('should translate tfa from english if not available target language', async () => {
    const targetLangResponse = GetFeaturedContentWithout(['tfa']);
    const result = await translateService.translateTfa(
      targetLangResponse,
      enResponse,
      'es',
    );

    expect(result.error).toBeNull();

    const tfa = result.value;
    expect(tfa.normalizedtitle).toEqual('Statue of Liberty-es');
    expect(tfa.extract).toEqual('The Statue of Liberty is a colossal.-es');
    expect(tfa.description).toEqual('Colossal sculpture in New York Harbor-es');
  });

  it('it should not translate image from english if not available', async () => {
    const targetLangResponse = GetWikipediaFeatured();

    const result = await translateService.translateImage(
      targetLangResponse,
      enResponse,
      'es',
    );

    expect(result.error).toBeNull();
    expect(result.value).toEqual(targetLangResponse.image);
  });

  it('it should translate image if available', async () => {
    const targetLangResponse = GetFeaturedContentWithout(['image']);

    const result = await translateService.translateImage(
      targetLangResponse,
      enResponse,
      'es',
    );

    expect(result.error).toBeNull();
    expect(result.value.title).toEqual(
      'File:TR Yedigöller asv2021-10 img16.jpg',
    );
    expect(result.value.description.text).toEqual(
      "The Seven Lakes' valley of Yedigöller National Park, Turkey. Photo shows Büyükgöl (Big Lake)-es",
    );
  });

  it('should translate mostread articles', async () => {
    const targetLangResponse = GetFeaturedContentWithout(['mostread']);
    const result = await translateService.translateMostRead(
      targetLangResponse,
      enResponse,
      'es',
    );
    expect(result.error).toBeNull();
    expect(result.value.articles).toHaveLength(
      enResponse.mostread.articles.length,
    );
    expect(result.value.articles[0].titles.normalized).toEqual(
      'Project 2025-es',
    );

    expect(result.value.articles[0].description).toEqual(
      'Proposed plan to consolidate executive power in a Republican president-es',
    );

    expect(result.value.articles[0].extract).toEqual(
      'Project 2025 is a collection of conservative and right-wing.-es',
    );
  });

  it('should translate on this day', async () => {
    const targetLangResponse = GetFeaturedContentWithout(['onthisday']);
    const result = await translateService.translateOnThisDay(
      targetLangResponse,
      enResponse,
      'es',
    );
    expect(result.error).toBeNull();
    expect(result.value).toHaveLength(enResponse.onthisday.length);
    expect(result.value[0].text).toEqual(
      'The impactor of the NASA space probe Deep Impact.-es',
    );
    expect(result.value[0].pages[0].titles.normalized).toEqual('NASA-es');
  });
});
