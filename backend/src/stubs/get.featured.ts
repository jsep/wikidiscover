import * as data from './data.json';
import type { WikipediaFeaturedContentResponse } from '../wikipedia.service';
import { ok, Result } from '../utils';
import { ApiError } from '../errors';
export function GetFeaturedRawContent() {
  return { ...data };
}

export function GetFeaturedContent(): Result<
  WikipediaFeaturedContentResponse,
  ApiError
> {
  return ok({ ...data });
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
