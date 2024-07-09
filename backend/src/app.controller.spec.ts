import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GetFeatured } from './stubs/get.featured';
import { url } from 'inspector';

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
        description: expect.any(String),
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
  it("should not return tfa if it's missing", async () => {
    fetchMock.mockResponse(JSON.stringify({ tfa: null }));
    const result = await appController.getFeed('en', '2024', '01', '01');

    expect(result).toEqual(
      expect.objectContaining({
        error: null,
        data: expect.objectContaining({ tfa: null }),
      }),
    );
  });

  it('should load image', async () => {
    const result = await appController.getFeed('en', '2024', '01', '01');
    expect(result).toEqual(expect.objectContaining({ error: null }));

    expect(result.data.image).toBeDefined();
    expect(result.data.image).not.toBeNull();

    expect(result.data.image).toEqual(
      expect.objectContaining({
        title: expect.stringMatching(/File/),
        description: expect.any(String),
        thumbnail: expect.objectContaining({
          height: expect.any(Number),
          source: expect.stringMatching(/upload\.wikimedia\.org/),
          width: expect.any(Number),
        }),
        timestamp: null,
        urls: expect.objectContaining({
          desktop: expect.stringMatching(/commons\.wikimedia\.org/),
          mobile: expect.stringMatching(/commons\.wikimedia\.org/),
        }),
      }),
    );
  });

  it("should not load image if it's missing", async () => {
    fetchMock.mockResponse(JSON.stringify({ image: null }));
    const result = await appController.getFeed('en', '2024', '01', '01');
    expect(result).toEqual(
      expect.objectContaining({
        error: null,
        data: expect.objectContaining({ image: null }),
      }),
    );
  });
  it('should load most read articles', async () => {
    const result = await appController.getFeed('en', '2024', '01', '01');
    expect(result).toEqual(expect.objectContaining({ error: null }));
    expect(result.data.mostReadArticles).toBeDefined();
    expect(result.data.mostReadArticles).toHaveLength(42);
    expect(result.data.mostReadArticles[0]).toEqual(
      expect.objectContaining({
        title: expect.stringMatching(/Project 2025/),
        description: expect.any(String),
        views: 442626,
        rank: 4,
        urls: expect.objectContaining({
          desktop: expect.stringMatching(/en\.wikipedia\.org/),
          mobile: expect.stringMatching(/en\.m\.wikipedia\.org/),
        }),
        thumbnail: expect.objectContaining({
          height: expect.any(Number),
          source: expect.stringMatching(/upload\.wikimedia\.org/),
          width: expect.any(Number),
        }),
      }),
    );
  });
  it("should not load most read articles if they're missing", async () => {
    fetchMock.mockResponse(JSON.stringify({ mostread: { articles: [] } }));
    const result = await appController.getFeed('en', '2024', '01', '01');
    expect(result).toEqual(expect.objectContaining({ error: null }));
    expect(result.data.mostReadArticles).toHaveLength(0);
  });
  it('should load onthisday', async () => {
    const result = await appController.getFeed('en', '2024', '01', '01');
    expect(result).toEqual(expect.objectContaining({ error: null }));
    expect(result.data.onThisDay).toBeDefined();
    expect(result.data.onThisDay).toHaveLength(23);
    expect(result.data.onThisDay[0]).toEqual(
      expect.objectContaining({
        title: expect.stringMatching(/NASA/),
        description: expect.any(String),
        urls: expect.objectContaining({
          desktop: expect.stringMatching(/en\.wikipedia\.org/),
          mobile: expect.stringMatching(/en\.m\.wikipedia\.org/),
        }),
        timestamp: expect.stringMatching(/1970-01-01/),
        thumbnail: expect.objectContaining({
          height: expect.any(Number),
          source: expect.stringMatching(/upload\.wikimedia\.org/),
          width: expect.any(Number),
        }),
      }),
    );
  });
});
