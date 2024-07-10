import { Injectable } from '@nestjs/common';
import { wikipediaLanguages } from './languages';
import * as fs from 'fs';
import { Result, attempt, attemptAsync, err, nonNull, ok } from './utils';
import { ConfigService } from '@nestjs/config';
import { WikipediaFeaturedContentResponse } from './wikipedia.service';
import { Language } from './languages.service';
import * as getProp from 'lodash.get';
import * as setProp from 'lodash.set';
import { TranslationApiError } from './errors';
import { Badge } from './app.controller';

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
  // TODO add all from deployed server
  supportedLanguages: Language[] = [
    { localName: 'English', name: 'English', code: 'en' },
    { localName: 'Español', name: 'Spanish', code: 'es' },
    { localName: '中文', name: 'Chinese', code: 'zh' },
    { localName: 'Suomi', name: 'Finnish', code: 'fi' },
    { localName: 'עברית', name: 'Hebrew', code: 'he' },
    { localName: 'Русский', name: 'Russian', code: 'ru' },
    { localName: 'العربية', name: 'Arabic', code: 'ar' },
    { localName: 'Azərbaycanca', name: 'Azerbaijani', code: 'az' },
    { localName: 'Български', name: 'Bulgarian', code: 'bg' },
    { localName: 'বাংলা', name: 'Bengali', code: 'bn' },
    { localName: 'Català', name: 'Catalan', code: 'ca' },
    { localName: 'Čeština', name: 'Czech', code: 'cs' },
    { localName: 'Dansk', name: 'Danish', code: 'da' },
  ];

  constructor(private configService: ConfigService) {}

  async translateBadges(
    badges: Badge[],
    lang: string,
  ): Promise<Result<Badge[], TranslationApiError>> {
    if (!this.isSupportedLanguage(lang)) {
      return ok(badges);
    }
    const translatedBadges = await Promise.all(
      badges.map((badge) => this.translateBadge(badge, lang)),
    );

    return ok(translatedBadges.map((badge) => badge.value));
  }

  async translateBadge(
    badge: Badge,
    lang: string,
  ): Promise<Result<Badge, TranslationApiError>> {
    if (!this.isSupportedLanguage(lang)) {
      return ok(badge);
    }
    const translation = await this.translate({
      text: badge.badge,
      from: 'en',
      to: lang,
    });
    if (translation.error) {
      console.error('Failed to translate badge', {
        badge,
        lang,
        translation,
      });

      return ok(badge);
    }
    return ok({ ...badge, badge: translation.value });
  }

  getSupportedLanguages() {
    return wikipediaLanguages;
  }

  isSupportedLanguage(lang: string): boolean {
    return this.supportedLanguages.some((language) => language.code === lang);
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
      return err(new TranslationApiError('TRANSLATE_API_URL is not set'));
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
        new TranslationApiError(
          `Failed to translate. Details: ${response.error}`,
        ),
      );
    }

    if (response.value.status !== 200) {
      return err(
        new TranslationApiError(
          `Failed to translate. Details: ${response.value.statusText}(${response.value.status})`,
        ),
      );
    }

    const json = await attemptAsync(async () => await response.value.json());

    if (json.error) {
      return err(
        new TranslationApiError(
          `Failed to parse translate response. Details: ${json.error}`,
        ),
      );
    }

    return ok(json.value.translatedText);
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

  async translateContentProperties(
    targetLangResponse: WikipediaFeaturedContentResponse,
    enResponse: WikipediaFeaturedContentResponse,
    targetLang: string,
    contentProperty: keyof WikipediaFeaturedContentResponse,
    propertiesToTranslate: string[],
  ): Promise<Result<any | null, Error>> {
    if (getProp(targetLangResponse, contentProperty)) {
      return ok(getProp(targetLangResponse, contentProperty));
    }

    if (
      !getProp(enResponse, contentProperty) ||
      !this.isSupportedLanguage(targetLang)
    ) {
      return ok(null);
    }

    return await this.translatePropertiesFromEn(
      enResponse[contentProperty],
      propertiesToTranslate,
      targetLang,
    );
  }

  async translateImage(
    targetLangResponse: WikipediaFeaturedContentResponse,
    enResponse: WikipediaFeaturedContentResponse,
    targetLang: string,
  ): Promise<Result<WikipediaFeaturedContentResponse['image'] | null, Error>> {
    return this.translateContentProperties(
      targetLangResponse,
      enResponse,
      targetLang,
      'image',
      ['description.text'],
    );
  }

  async translateTfa(
    targetLangResponse: WikipediaFeaturedContentResponse,
    enResponse: WikipediaFeaturedContentResponse,
    targetLang: string,
  ): Promise<Result<WikipediaFeaturedContentResponse['tfa'] | null, Error>> {
    return this.translateContentProperties(
      targetLangResponse,
      enResponse,
      targetLang,
      'tfa',
      ['titles.normalized', 'normalizedtitle', 'extract', 'description'],
    );
  }

  async translateWikipediaResponse(
    targetLangResponse: WikipediaFeaturedContentResponse,
    enResponse: WikipediaFeaturedContentResponse,
    targetLang: string,
  ): Promise<Result<WikipediaFeaturedContentResponse, TranslationApiError>> {
    const translatedResults = await Promise.all([
      this.translateImage(targetLangResponse, enResponse, targetLang),
      this.translateTfa(targetLangResponse, enResponse, targetLang),
      this.translateMostRead(targetLangResponse, enResponse, targetLang),
      this.translateOnThisDay(targetLangResponse, enResponse, targetLang),
      this.translateNews(targetLangResponse, enResponse, targetLang),
    ]);
    if (translatedResults.some((result) => result.error)) {
      console.error(`Failed to translate wikipedia response`);
      fs.writeFileSync(
        `./failed-translate-${targetLang}.json`,
        JSON.stringify(
          {
            targetLangResponse,
            enResponse,
            targetLang,
            translatedResults,
          },
          null,
          2,
        ),
      );
      // return err(
      //   new TranslateRequestError(
      //     `Failed to translate wikipedia response. Details: ` +
      //       translatedResults.map((result) => result.error).join(', '),
      //   ),
      // );
    }
    const translatedImage = translatedResults[0];
    const translatedTfa = translatedResults[1];
    const translatedMostRead = translatedResults[2];
    const translatedOnThisDay = translatedResults[3];
    const translatedNews = translatedResults[4];

    return ok({
      ...targetLangResponse,
      tfa: translatedTfa.error ? null : translatedTfa.value,
      image: translatedImage.error ? null : translatedImage.value,
      mostread: translatedMostRead.error ? null : translatedMostRead.value,
      onthisday: translatedOnThisDay.error ? null : translatedOnThisDay.value,
      news: translatedNews.error ? null : translatedNews.value,
    });
  }

  async translateMostRead(
    targetLangResponse: WikipediaFeaturedContentResponse,
    enResponse: WikipediaFeaturedContentResponse,
    lang: string,
  ): Promise<
    Result<
      WikipediaFeaturedContentResponse['mostread'] | null,
      TranslationApiError
    >
  > {
    if (
      targetLangResponse.mostread &&
      targetLangResponse.mostread?.articles.length > 0
    ) {
      return ok(targetLangResponse.mostread);
    }

    if (
      !enResponse.mostread ||
      enResponse.mostread?.articles?.length === 0 ||
      !this.isSupportedLanguage(lang)
    ) {
      return ok(null);
    }

    const translatedArticles = await Promise.all(
      enResponse.mostread.articles.map((article) =>
        this.translateMostReadArticle(article, lang),
      ),
    );

    if (translatedArticles.some((article) => article.error)) {
      return err(
        new TranslationApiError(
          `Failed to translate most read articles. Details: ` +
            translatedArticles.map((article) => article.error).join(', '),
        ),
      );
    }

    return ok({
      ...enResponse.mostread,
      articles: translatedArticles.map((article) => article.value),
    });
  }

  async translatePropertiesFromEn(
    source: any,
    properties: string[],
    to: string,
  ): Promise<Result<any, Error>> {
    const translatedProperties = await Promise.all(
      properties.map(async (prop) => {
        return {
          prop,
          translation: await this.translate({
            text: getProp(source, prop),
            from: 'en',
            to,
          }),
        };
      }),
    );

    if (translatedProperties.some((prop) => prop.translation.error)) {
      console.error(`Failed to translate properties`, {
        source,
        translatedProperties,
      });
      return err(
        new TranslationApiError(
          `Failed to translate properties. Details: ` +
            translatedProperties
              .map((prop) => prop.translation.error)
              .join(', '),
        ),
      );
    }

    translatedProperties.forEach((prop) => {
      setProp(source, prop.prop, prop.translation.value) + 'jacobo';
    });

    return ok(source);
  }

  translateMostReadArticle = async (
    article: WikipediaFeaturedContentResponse['mostread']['articles'][0],
    lang: string,
  ) => {
    const propertiesToTranslate = [
      'titles.normalized',
      'description',
      'extract',
    ];

    const result = await this.translatePropertiesFromEn(
      article,
      propertiesToTranslate,
      lang,
    );

    if (result.error) {
      return result;
    }

    return ok(article);
  };

  async translateOnThisDay(
    targetLangResponse: WikipediaFeaturedContentResponse,
    enResponse: WikipediaFeaturedContentResponse,
    lang: string,
  ): Promise<
    Result<WikipediaFeaturedContentResponse['onthisday'] | null, Error>
  > {
    if (
      targetLangResponse.onthisday &&
      targetLangResponse.onthisday.length > 0
    ) {
      return ok(targetLangResponse.onthisday);
    }

    if (
      !enResponse.onthisday ||
      enResponse.onthisday.length === 0 ||
      !this.isSupportedLanguage(lang)
    ) {
      return ok(null);
    }

    const translatedEvents = await Promise.all(
      enResponse.onthisday.map((event) =>
        this.translateOnThisDayEvent(event, lang),
      ),
    );

    if (translatedEvents.some((event) => event.error)) {
      return err(
        new TranslationApiError(
          `Failed to translate on this day events. Details: ` +
            translatedEvents.map((event) => event.error).join(', '),
        ),
      );
    }

    return ok(translatedEvents.map((event) => event.value));
  }

  async translateOnThisDayEvent(
    event: WikipediaFeaturedContentResponse['onthisday'][0],
    lang: string,
  ) {
    return this.translatePropertiesFromEn(
      event,
      [
        'text',
        'pages[0].titles.normalized',
        // 'pages[0].extract',
        // 'pages[0].description',
      ],
      lang,
    );
  }

  async translateNews(
    targetLangResponse: WikipediaFeaturedContentResponse,
    enResponse: WikipediaFeaturedContentResponse,
    lang: string,
  ): Promise<
    Result<WikipediaFeaturedContentResponse['news'] | null, TranslationApiError>
  > {
    if (targetLangResponse.news && targetLangResponse.news.length > 0) {
      return ok(targetLangResponse.news);
    }

    if (
      !enResponse.news ||
      enResponse.news.length === 0 ||
      !this.isSupportedLanguage(lang)
    ) {
      return ok(null);
    }

    const translatedNews = await Promise.all(
      enResponse.news.map((article) =>
        this.translateNewsArticle(article, lang),
      ),
    );

    if (translatedNews.some((article) => article.error)) {
      return err(
        new TranslationApiError(
          `Failed to translate news articles. Details: ` +
            translatedNews.map((article) => article.error).join(', '),
        ),
      );
    }

    return ok(translatedNews.map((article) => article.value));
  }

  async translateNewsArticle(
    newsArticle: WikipediaFeaturedContentResponse['news'][0],
    lang: string,
  ) {
    return this.translatePropertiesFromEn(
      newsArticle,
      [
        'links[0].normalizedtitle',
        'links[0].titles.normalized',
        'links[0].extract',
      ],
      lang,
    );
  }
}
