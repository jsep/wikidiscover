import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GetFeatured } from './stubs/get.featured';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
    fetchMock.resetMocks();

    fetchMock.mockResponse(JSON.stringify(GetFeatured()));

    // jest.spyOn(appService, 'wikipediaRequest').mockResolvedValue({
    //   error: null,
    //   value: GetFeatured(),
    // });
  });

  it('should validate date', async () => {
    await expect(
      appController.getFeed('en', '2024', '01', '01'),
    ).resolves.toEqual(expect.objectContaining({ error: null }));

    await expect(
      appController.getFeed('en', 'bad', '01', '01'),
    ).resolves.toEqual({
      error: expect.stringContaining('Invalid date'),
      data: null,
    });

    await expect(
      appController.getFeed('en', '2024', '13', '01'),
    ).resolves.toEqual({
      error: expect.stringContaining('Invalid date'),
      data: null,
    });

    await expect(
      appController.getFeed('en', '2024', '01', '32'),
    ).resolves.toEqual({
      error: expect.stringContaining('Invalid date'),
      data: null,
    });
  });

  it('should validate languages', async () => {
    await expect(
      appController.getFeed('en', '2024', '01', '01'),
    ).resolves.toEqual(expect.objectContaining({ error: null }));

    await expect(
      appController.getFeed('es', '2024', '01', '01'),
    ).resolves.toEqual(expect.objectContaining({ error: null }));

    await expect(
      appController.getFeed('bad', '2024', '01', '01'),
    ).resolves.toEqual(
      expect.objectContaining({
        error: expect.stringContaining('Unsupported language'),
        data: null,
      }),
    );
  });

  it('should load tfa', async () => {
    const result = await appController.getFeed('en', '2024', '01', '01');
    expect(result).toEqual(expect.objectContaining({ error: null }));

    expect(result.data.tfa).toBeDefined();
    expect(result.data.tfa).toEqual(
      expect.objectContaining({
        urls: expect.objectContaining({
          desktop: expect.stringMatching(/en\.wikipedia\.org/),
          mobile: expect.stringMatching(/en\.m\.wikipedia\.org/),
        }),
        description: 'Colossal sculpture in New York Harbor',
        dir: 'ltr',
        lang: 'en',
        thumbnail: expect.objectContaining({
          height: expect.any(Number),
          source: expect.stringMatching(/upload\.wikimedia\.org/),
          width: expect.any(Number),
        }),
        timestamp: expect.stringMatching('2024-07-06'),
        title: 'Statue of Liberty',
      }),
    );
  });
});
