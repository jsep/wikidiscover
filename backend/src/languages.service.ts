import { Injectable } from '@nestjs/common';
import { wikipediaLanguages } from './languages';
import { GetFeaturedRawContent } from './stubs/get.featured';
import * as fs from 'fs';
import { Result, attempt, attemptAsync, err, nonNull, ok } from './utils';
import { ConfigService } from '@nestjs/config';

export type Language = {
  localName: string;
  name: string;
  code: string;
};

@Injectable()
export class LanguagesService {
  getSupportedLanguages() {
    return wikipediaLanguages;
  }
}
