import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { TranslateService } from './translate.service';
import {
  WikipediaService,
  WikipediaFeaturedContentResponse,
} from './wikipedia.service';
import { ConfigModule } from '@nestjs/config';
import { PostTranslate } from './stubs/post.translate';
import { GetFeatured as GetWikipediaFeatured } from './stubs/get.featured';

describe('TranslateService', () => {
  let translateService: TranslateService;
  let wikipediaResponse: WikipediaFeaturedContentResponse;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [],
      providers: [TranslateService],
    }).compile();

    translateService = app.get<TranslateService>(TranslateService);
    wikipediaResponse = GetWikipediaFeatured();
  });

  it('should translate text', async () => {
    fetchMock.mockResponse(JSON.stringify(PostTranslate('text', 'es')));

    const result = await translateService.translate({
      text: 'text',
      from: 'en',
      to: 'es',
    });

    expect(result.error).toBeNull();
    expect(result.value).toEqual('text-es');
  });

  it('should translate tfa', async () => {
    fetchMock.mockResponse(JSON.stringify(PostTranslate('text', 'es')));

    const result = await translateService.translate({
      text: 'text',
      from: 'en',
      to: 'es',
    });
  });
});
