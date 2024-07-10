import { ApiError, FeedDtoResponse } from '../../ApiGateway.ts';
import { dateToIso, ok, Result } from '../../utils.ts';
import rawResponse from './data.json';
import getProp from 'lodash.get';
import setProp from 'lodash.set';
import cloneDeep from 'lodash.clonedeep';
import { Badge } from '../../Feed/FeedRepository.ts';
import { observer } from 'mobx-react-lite';

export function GetFeedRawResponse(date: Date, lang: string) {
  const response = cloneDeep(rawResponse);
  const basePath = 'value.wikipediaResponse';
  const dateAndLang = ' ' + dateToIso(date) + '-' + lang;

  setProp(response, 'value.date', dateToIso(date));
  setProp(response, 'value.lang', lang);
  const featureContentLabelPath = basePath + '.featureContentLabel';
  const featureContentLabel = getProp(response, featureContentLabelPath);

  setProp(response, featureContentLabelPath, featureContentLabel + dateAndLang);

  const badgesPath = 'value.badges';
  const badges: Badge[] = getProp(response, badgesPath);
  setProp(
    response,
    badgesPath,
    badges.map((badge) => ({
      ...badge,
      badge: badge.badge + dateAndLang,
    })),
  );

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
    setProp(response, tfaPath + '.' + property, tfa[property] + dateAndLang);
  });

  return response;
}

export function GetFeedDtoStub(date: Date, lang: string): FeedDtoResponse {
  return GetFeedRawResponse(date, lang);
}

export function GetFeedStub(
  date: Date,
  lang: string,
): Result<FeedDto, ApiError> {
  return ok<FeedDto, ApiError>({
    error: null,
    data: {
      date: dateToIso(date),
      lang: lang,
      tfa: {
        id: 'tfa' + dateToIso(date),
        title:
          (lang == 'es' ? 'Estatua de la Libertad' : 'Statue of Liberty') +
          ' ' +
          dateToIso(date),
        thumbnail: {
          source:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Front_view_of_Statue_of_Liberty_with_pedestal_and_base_2024.jpg/640px-Front_view_of_Statue_of_Liberty_with_pedestal_and_base_2024.jpg',
          width: 640,
          height: 1407,
        },
        timestamp: date.toUTCString(),
        urls: {
          desktop: 'https://en.wikipedia.org/wiki/Statue_of_Liberty',
          mobile: 'https://en.m.wikipedia.org/wiki/Statue_of_Liberty',
        },
        description:
          'The Statue of Liberty is a colossal neoclassical sculpture on Liberty Island in New York Harbor, within New York City. The copper-clad statue, a gift to the United States from the people of France, was designed by French sculptor Frédéric Auguste Bartholdi and its metal framework was built by Gustave Eiffel. The statue was dedicated on October 28, 1886.',
      },
      mostReadArticles: [
        {
          id: 'mostread' + dateToIso(date),
          views: 442626,
          rank: 4,
          title: 'Project 2025 ' + dateToIso(date),
          thumbnail: {
            source:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/2025_Mandate_for_Leadership_cover.jpg/320px-2025_Mandate_for_Leadership_cover.jpg',
            width: 320,
            height: 457,
          },
          timestamp: date.toUTCString(),
          urls: {
            desktop: 'https://en.wikipedia.org/wiki/Project_2025',
            mobile: 'https://en.m.wikipedia.org/wiki/Project_2025',
          },
          description:
            'Project 2025, also known as the Presidential Transition Project, is a collection of conservative and right-wing policy proposals from the Heritage Foundation to reshape the United States federal government and consolidate executive power should the Republican Party candidate win the 2024 presidential election. It proposes reclassifying tens of thousands of merit-based federal civil service workers as political appointees in order to replace them with those who will be more willing to enact the wishes of the next Republican president. It asserts that the president has absolute power over the executive branch. Critics of Project 2025 have characterized it as an authoritarian, Christian nationalist plan to transform the United States into an autocracy. Many legal experts have asserted it would undermine the rule of law, the separation of powers, the separation of church and state, and civil liberties.',
        },
      ],
      image: {
        id: 'image' + dateToIso(date),
        title: 'File:Image ' + dateToIso(date),
        thumbnail: {
          source:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/TR_Yedig%C3%B6ller_asv2021-10_img16.jpg/640px-TR_Yedig%C3%B6ller_asv2021-10_img16.jpg',
          width: 640,
          height: 400,
        },
        urls: {
          mobile:
            'https://commons.wikimedia.org/wiki/File:TR_Yedig%C3%B6ller_asv2021-10_img16.jpg',
          desktop:
            'https://commons.wikimedia.org/wiki/File:TR_Yedig%C3%B6ller_asv2021-10_img16.jpg',
        },
        description:
          'The Seven Lakes\' valley of <a rel="mw:WikiLink/Interwiki" href="https://en.wikipedia.org/wiki/Yedigöller%20National%20Park" title="w:Yedigöller National Park" class="extiw">Yedigöller National Park</a>, <a rel="mw:WikiLink/Interwiki" href="https://en.wikipedia.org/wiki/Turkey" title="w:Turkey" class="extiw">Turkey</a>. Photo shows Büyükgöl (Big Lake)',
      },
      onThisDay: [
        {
          id: 'onthisday' + dateToIso(date),
          title: 'NASA ' + dateToIso(date),
          thumbnail: {
            source:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/320px-NASA_logo.svg.png',
            width: 320,
            height: 268,
          },
          description:
            "The National Aeronautics and Space Administration is an independent agency of the U.S. federal government responsible for the civil space program, aeronautics research, and space research. Established in 1958, it succeeded the National Advisory Committee for Aeronautics (NACA) to give the U.S. space development effort a distinct civilian orientation, emphasizing peaceful applications in space science. It has since led most of America's space exploration programs, including Project Mercury, Project Gemini, the 1968–1972 Apollo Moon landing missions, the Skylab space station, and the Space Shuttle. Currently, NASA supports the International Space Station (ISS) along with the Commercial Crew Program, and oversees the development of the Orion spacecraft and the Space Launch System for the lunar Artemis program.",
          timestamp: date.toUTCString(),
          urls: {
            desktop: 'https://en.wikipedia.org/wiki/NASA',
            mobile: 'https://en.m.wikipedia.org/wiki/NASA',
          },
        },
      ],
    },
  });
}

export function GetFeedWithNoTFAStub(
  date: Date,
  lang: string,
  without: Array<keyof FeedDto['data']> = [],
): Result<FeedDto, ApiError> {
  const { value } = GetFeedStub(date, lang);
  const feedDto = value as FeedDto;

  for (const key of without) {
    if (Array.isArray(feedDto.data[key])) {
      // @ts-expect-error
      feedDto.data[key] = [];
    } else {
      // @ts-expect-error
      feedDto.data[key] = null;
    }
  }

  return ok<FeedDto, ApiError>(feedDto);
}
