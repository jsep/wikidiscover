import { Controller, Get, Param } from '@nestjs/common';
import {
  WikipediaFeaturedContentResponse,
  WikipediaService,
} from './wikipedia.service';
import { TranslateService } from './translate.service';
import { Result, err, ok } from './utils';
import { ApiError } from './errors';

export type Badges = {
  type: 'tfa' | 'image' | 'mostread' | 'onthisday';
  badge: string;
};

export interface FeaturedContentResponse {
  lang: string;
  date: string;
  badges: Badges[];
  wikipediaResponse: WikipediaFeaturedContentResponse;
}

@Controller()
export class AppController {
  constructor(
    private readonly wikipediaService: WikipediaService,
    private readonly translateService: TranslateService,
  ) {}

  @Get('languages')
  async getLanguages(): Promise<string[]> {
    return await this.wikipediaService.supportedLanguages;
  }

  @Get('translate')
  async getTranslate(): Promise<string> {
    const result = await this.translateService.translate({
      text: 'Hello, world!',
      from: 'en',
      to: 'es',
    });
    console.log('translate');
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.value;
  }

  @Get('feed/:lang/featured/:year/:month/:day')
  async getFeed(
    @Param('lang') lang: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('day') day: string,
  ): Promise<{ error: string | null; data: any }> {
    const result = await this.wikipediaService.getFeaturedContent(
      lang,
      year,
      month,
      day,
    );
    return {
      error: result.error ? result.error.message : null,
      data: result.value,
    };
  }

  @Get('feed2/:lang/featured/:year/:month/:day')
  async getFeaturedContent(
    @Param('lang') lang: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('day') day: string,
  ): Promise<
    Result<FeaturedContentResponse, { message: string; code: string }>
  > {
    let result = await this.wikipediaService.getFeaturedContent(
      lang,
      year,
      month,
      day,
    );

    result = await this.getTranslatedResponseIfNeeded(
      result,
      lang,
      year,
      month,
      day,
    );

    if (result.error) {
      return err({
        message: result.error.message,
        code: result.error.code,
      });
    }

    return ok({
      date: `${year}-${month}-${day}`,
      lang: lang,
      badges: this.getBadges(lang),
      wikipediaResponse: result.value,
    } as FeaturedContentResponse);
  }

  private shouldTranslate(lang: string) {
    return lang != 'en';
  }

  private async getTranslatedResponseIfNeeded(
    targetLanResult: Result<WikipediaFeaturedContentResponse, ApiError>,
    lang: string,
    year: string,
    month: string,
    day: string,
  ): Promise<Result<WikipediaFeaturedContentResponse, ApiError>> {
    if (targetLanResult.error) {
      console.log('Failed to get featured content', {
        lang,
        year,
        month,
        day,
        result: targetLanResult,
      });

      return targetLanResult;
    }

    if (!this.shouldTranslate(lang)) {
      return ok(targetLanResult.value);
    }

    const enResult = await this.wikipediaService.getFeaturedContent(
      'en',
      year,
      month,
      day,
    );

    if (enResult.error) {
      console.error('Failed to get featured content for en', {
        lang,
        year,
        month,
        day,
        enResult,
      });

      // fallback to original result
      return targetLanResult;
    }

    const translatedResult =
      await this.translateService.translateWikipediaResponse(
        targetLanResult.value,
        enResult.value,
        lang,
      );

    if (translatedResult.error) {
      console.error('Failed to get featured content translated for lang', {
        lang,
        year,
        month,
        day,
        translatedResult,
      });

      // fallback to original result
      return targetLanResult;
    }

    return translatedResult;
  }

  private getBadges(lang: string) {
    return [
      {
        type: 'tfa',
        badge: 'Featured',
      },
      {
        type: 'image',
        badge: 'Image',
      },
      {
        type: 'mostread',
        badge: 'Most read',
      },
      {
        type: 'onthisday',
        badge: 'On this day',
      },
    ];
  }
}
