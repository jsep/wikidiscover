import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GetFeatured } from './stubs/get.featured';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
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
});
