import { Injectable } from '@nestjs/common';
import { wikipediaLanguages } from './languages';
import { GetFeatured } from './stubs/get.featured';
import * as fs from 'fs';
import { Result, attempt, attemptAsync, err, nonNull, ok } from './utils';
import { ConfigService } from '@nestjs/config';
import { WikipediaFeaturedContentResponse } from './wikipedia.service';

export interface TranslateResponse {
  alternatives: string[];
  detectedLanguage: {
    confidence: number;
    language: string;
  };
  translatedText: string;
}

@Injectable()
export class TranslateService {
  supportedLanguages: string[];
  constructor(private configService: ConfigService) {
    this.supportedLanguages = wikipediaLanguages.map(
      (language) => language.code,
    );
  }

  getSupportedLanguages() {
    return wikipediaLanguages;
  }

  async translateWikipediaResponse(
    targetLangResponse: WikipediaFeaturedContentResponse,
    enResponse: WikipediaFeaturedContentResponse,
    targetLang: string,
  ) {
    return targetLangResponse;
  }

  async translateTfa(
    tfa: WikipediaFeaturedContentResponse['tfa'],
    lang: string,
  ) {
    return tfa;
  }

  async translate({
    text,
    from,
    to,
  }: {
    text: string;
    from: string;
    to: string;
  }): Promise<Result<string, Error>> {
    return this.translateRequest({ text: text, source: from, target: to });
  }

  async translateRequest({
    text,
    source,
    target,
  }: {
    text: string;
    source: string;
    target: string;
  }): Promise<Result<string, Error>> {
    const url = this.configService.get<string>('TRANSLATE_API_URL');

    if (!url) {
      return err(new TranslateRequestError('TRANSLATE_API_URL is not set'));
    }

    const formData = new FormData();
    formData.append('q', text);
    formData.append('source', source);
    formData.append('target', target);
    formData.append('format', 'text');
    formData.append('api_key', '');

    const response = await attemptAsync(
      async () =>
        await fetch(url + '/translate', {
          method: 'POST',
          body: formData,
        }),
    );

    if (response.error) {
      console.error('Translate response.error', response.error);
      return err(
        new TranslateRequestError(
          `Failed to translate. Details: ${response.error}`,
        ),
      );
    }

    if (response.value.status !== 200) {
      return err(
        new TranslateRequestError(
          `Failed to translate. Details: ${response.value.statusText}(${response.value.status})`,
        ),
      );
    }

    const json = await attemptAsync(async () => await response.value.json());

    if (json.error) {
      return err(
        new TranslateRequestError(
          `Failed to parse translate response. Details: ${json.error}`,
        ),
      );
    }

    return ok(json.value.translatedText);
  }
}

export class TranslateRequestError extends Error {}
