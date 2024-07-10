import { ApiError, FeedDtoResponse } from '../../ApiGateway.ts';
import { dateToIso, ok, Result } from '../../utils.ts';
import rawResponse from './data.json';
import getProp from 'lodash.get';
import setProp from 'lodash.set';
import cloneDeep from 'lodash.clonedeep';

export function GetFeedRawResponse() {
  return rawResponse;
}

export function UpdateFeedRawResponse(date: Date, lang: string) {
  const response = cloneDeep(rawResponse);
  const basePath = 'value.wikipediaResponse';
  const dateAndLang = ' ' + dateToIso(date) + '-' + lang;

  setProp(response, 'value.date', dateToIso(date));
  setProp(response, 'value.lang', lang);
  const featureContentLabelPath = 'value.featureContentLabel';
  const featureContentLabel = getProp(response, featureContentLabelPath);

  setProp(response, featureContentLabelPath, featureContentLabel + dateAndLang);

  const badgesPath = 'value.badges';
  const badges = getProp(response, badgesPath);
  setProp(
    response,
    badgesPath,
    badges.map((badge) => ({
      ...badge,
      badge: badge.badge + dateAndLang,
    })),
  );

  // update tfa
  const tfaPath = basePath + '.tfa';
  const tfa = getProp(response, tfaPath);
  setProp(response, tfaPath + '.timestamp', date.toUTCString());

  const tfaPropertiesToUpdate = [
    'titles.normalized',
    'normalizedtitle',
    'extract',
    'description',
  ];

  tfaPropertiesToUpdate.forEach((property) => {
    setProp(
      response,
      tfaPath + '.' + property,
      getProp(tfa, property) + dateAndLang,
    );
  });

  // update image
  const imagePath = basePath + '.image';
  const image = getProp(response, imagePath);
  const imagePropertiesToUpdate = ['title', 'description.text'];

  imagePropertiesToUpdate.forEach((property) => {
    setProp(
      response,
      imagePath + '.' + property,
      getProp(image, property) + dateAndLang,
    );
  });

  // update mostread
  const mostReadPath = basePath + '.mostread';
  const mostRead = getProp(response, mostReadPath);
  const mostReadPropertiesToUpdate = [
    'articles.[0].titles.normalized',
    'articles.[0].description',
    'articles.[0].extract',
  ];

  mostReadPropertiesToUpdate.forEach((property) => {
    setProp(
      response,
      mostReadPath + '.' + property,
      getProp(mostRead, property) + dateAndLang,
    );
  });

  // update onthisday
  const onThisDayPath = basePath + '.onthisday.[0]';
  const onThisDay = getProp(response, onThisDayPath);
  const onThisDayPropertiesToUpdate = ['text', 'pages.[0].titles.normalized'];
  onThisDayPropertiesToUpdate.forEach((property) => {
    setProp(
      response,
      onThisDayPath + '.' + property,
      getProp(onThisDay, property) + dateAndLang,
    );
  });

  // update news
  const newsPath = basePath + '.news.[0]';
  const news = getProp(response, newsPath);
  const newsPropertiesToUpdate = [
    'links[0].normalizedtitle',
    'links[0].titles.normalized',
    'links[0].extract',
  ];

  newsPropertiesToUpdate.forEach((property) => {
    setProp(
      response,
      newsPath + '.' + property,
      getProp(news, property) + dateAndLang,
    );
  });
  return response;
}

export function GetFeedDtoStub(
  date: Date,
  lang: string,
): Result<FeedDtoResponse, ApiError> {
  return ok<FeedDtoResponse, ApiError>(UpdateFeedRawResponse(date, lang));
}

export function GetFeedWithout(
  date: Date,
  lang: string,
  without: Array<keyof FeedDtoResponse['value']['wikipediaResponse']> = [],
): Result<FeedDtoResponse, ApiError> {
  const { value } = GetFeedDtoStub(date, lang);
  const feedDto = value as FeedDtoResponse;

  for (const key of without) {
    if (Array.isArray(feedDto.value.wikipediaResponse[key])) {
      // @ts-expect-error
      feedDto.value.wikipediaResponse[key] = [];
    } else {
      // @ts-expect-error
      feedDto.value.wikipediaResponse[key] = null;
    }
  }

  return ok(feedDto);
}
