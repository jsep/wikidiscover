import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { WikipediaService } from './wikipedia.service';
import {
  GetFeaturedContent,
  GetFeaturedRawContent,
} from './stubs/get.featured';
import { url } from 'inspector';
import { TranslateService } from './translate.service';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: WikipediaService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [AppController],
      providers: [
        WikipediaService,
        TranslateService,
        {
          provide: CacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            getJson: jest.fn().mockResolvedValue(null),
            setJson: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<WikipediaService>(WikipediaService);

    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify(GetFeaturedContent()));

    // jest.spyOn(appService, 'wikipediaRequest').mockResolvedValue({
    //   error: null,
    //   value: GetFeaturedRawContent(),
    // });
  });

  it('should validate date', async () => {
    await expect(
      appController.getFeaturedContent('en', '2024', '01', '01'),
    ).resolves.toEqual(expect.objectContaining({ error: null }));

    await expect(
      appController.getFeaturedContent('en', 'bad', '01', '01'),
    ).resolves.toEqual({
      error: {
        code: 'WIKIPEDIA_API_ERROR',
        message: 'Invalid date',
      },
      value: null,
    });

    await expect(
      appController.getFeaturedContent('en', '2024', '13', '01'),
    ).resolves.toEqual({
      error: {
        code: 'WIKIPEDIA_API_ERROR',
        message: 'Invalid date',
      },
      value: null,
    });

    await expect(
      appController.getFeaturedContent('en', '2024', '01', '32'),
    ).resolves.toEqual({
      error: {
        code: 'WIKIPEDIA_API_ERROR',
        message: 'Invalid date',
      },
      value: null,
    });
  });
});
