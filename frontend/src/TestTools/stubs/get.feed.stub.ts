import { ApiError, FeedDto, Result } from '../../ApiGateway.ts';
import { dateToIso } from '../../utils.ts';

export function GetFeedStub(
  date: Date,
  lang: string,
): Result<FeedDto, ApiError> {
  return {
    error: null,
    value: {
      date: dateToIso(date),
      lang: lang,
      tfa: {
        title: 'Statue_of_Liberty',
        thumbnail: {
          source:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Front_view_of_Statue_of_Liberty_with_pedestal_and_base_2024.jpg/640px-Front_view_of_Statue_of_Liberty_with_pedestal_and_base_2024.jpg',
          width: 640,
          height: 1407,
        },
        lang: 'en',
        dir: 'ltr',
        timestamp: '2024-07-06T13:34:26Z',
        description: 'Colossal sculpture in New York Harbor',
        content_urls: {
          desktop: 'https://en.wikipedia.org/wiki/Statue_of_Liberty',
          mobile: 'https://en.m.wikipedia.org/wiki/Statue_of_Liberty',
        },
        extract:
          'The Statue of Liberty is a colossal neoclassical sculpture on Liberty Island in New York Harbor, within New York City. The copper-clad statue, a gift to the United States from the people of France, was designed by French sculptor Frédéric Auguste Bartholdi and its metal framework was built by Gustave Eiffel. The statue was dedicated on October 28, 1886.',
      },
      mostRead: [
        {
          views: 442626,
          rank: 4,
          title: 'Project_2025',
          thumbnail: {
            source:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/2025_Mandate_for_Leadership_cover.jpg/320px-2025_Mandate_for_Leadership_cover.jpg',
            width: 320,
            height: 457,
          },
          lang: 'en',
          dir: 'ltr',
          timestamp: '2024-07-06T13:40:31Z',
          description:
            'Proposed plan to consolidate executive power in a Republican president',
          content_urls: {
            desktop: 'https://en.wikipedia.org/wiki/Project_2025',
            mobile: 'https://en.m.wikipedia.org/wiki/Project_2025',
          },
          extract:
            'Project 2025, also known as the Presidential Transition Project, is a collection of conservative and right-wing policy proposals from the Heritage Foundation to reshape the United States federal government and consolidate executive power should the Republican Party candidate win the 2024 presidential election. It proposes reclassifying tens of thousands of merit-based federal civil service workers as political appointees in order to replace them with those who will be more willing to enact the wishes of the next Republican president. It asserts that the president has absolute power over the executive branch. Critics of Project 2025 have characterized it as an authoritarian, Christian nationalist plan to transform the United States into an autocracy. Many legal experts have asserted it would undermine the rule of law, the separation of powers, the separation of church and state, and civil liberties.',
        },
      ],
      image: {
        title: 'File:TR Yedigöller asv2021-10 img16.jpg',
        thumbnail: {
          source:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/TR_Yedig%C3%B6ller_asv2021-10_img16.jpg/640px-TR_Yedig%C3%B6ller_asv2021-10_img16.jpg',
          width: 640,
          height: 400,
        },
        file_page:
          'https://commons.wikimedia.org/wiki/File:TR_Yedig%C3%B6ller_asv2021-10_img16.jpg',
        artist: {
          html: '<b><span class="plainlinks"><a class="external text" href="https://commons.wikimedia.org/wiki/User:A.Savin">A.Savin</a></span></b>',
          text: 'A.Savin',
        },
        credit: {
          html: '<span class="int-own-work" lang="en">Own work</span>',
          text: 'Own work',
        },
        license: { type: 'FAL', url: 'http://artlibre.org/licence/lal/en' },
        description:
          'The Seven Lakes\' valley of <a rel="mw:WikiLink/Interwiki" href="https://en.wikipedia.org/wiki/Yedigöller%20National%20Park" title="w:Yedigöller National Park" class="extiw">Yedigöller National Park</a>, <a rel="mw:WikiLink/Interwiki" href="https://en.wikipedia.org/wiki/Turkey" title="w:Turkey" class="extiw">Turkey</a>. Photo shows Büyükgöl (Big Lake)',
      },
      onThisDay: [
        {
          title: 'NASA',
          description:
            'The impactor of the NASA space probe Deep Impact collided with the comet Tempel 1, excavating interior material to study its composition.',
          thumbnail: {
            source:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/320px-NASA_logo.svg.png',
            width: 320,
            height: 268,
          },
          lang: 'en',
          dir: 'ltr',
          extract:
            "The National Aeronautics and Space Administration is an independent agency of the U.S. federal government responsible for the civil space program, aeronautics research, and space research. Established in 1958, it succeeded the National Advisory Committee for Aeronautics (NACA) to give the U.S. space development effort a distinct civilian orientation, emphasizing peaceful applications in space science. It has since led most of America's space exploration programs, including Project Mercury, Project Gemini, the 1968–1972 Apollo Moon landing missions, the Skylab space station, and the Space Shuttle. Currently, NASA supports the International Space Station (ISS) along with the Commercial Crew Program, and oversees the development of the Orion spacecraft and the Space Launch System for the lunar Artemis program.",
          year: 2005,
          timestamp: '2024-07-06T13:40:31Z',
          content_urls: {
            desktop: 'https://en.wikipedia.org/wiki/NASA',
            mobile: 'https://en.m.wikipedia.org/wiki/NASA',
          },
        },
      ],
    },
  };
}
