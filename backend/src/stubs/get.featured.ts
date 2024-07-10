import * as data from './data.json';
import type { WikipediaFeaturedContentResponse } from '../wikipedia.service';
export function GetFeaturedContent() {
  return { ...data };
}

export function GetFeaturedContentWithout(
  keys: Array<keyof WikipediaFeaturedContentResponse>,
): WikipediaFeaturedContentResponse {
  const response = { ...data };
  keys.forEach((key) => {
    if (Array.isArray(response[key])) {
      // @ts-ignore
      response[key] = [];
    }
    response[key] = null;
  });

  return response;
}
