import { Injectable } from '@nestjs/common';
import { wikipediaLanguages } from './languages';
import { GetFeaturedRawContent } from './stubs/get.featured';
import * as fs from 'fs';
import { Result, attempt, attemptAsync, err, nonNull, ok } from './utils';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export type Language = {
  localName: string;
  name: string;
  code: string;
};

@Injectable()
export class CacheService {
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      throw new Error('REDIS_URL is not set');
    }

    this.client = new Redis(redisUrl);
  }

  async set(key: string, value: string) {
    return this.client.set(key, value, 'EX', 1800); // 1800 seconds = 30 minutes
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async setJson(key: string, value: any) {
    return this.client.set(key, JSON.stringify(value));
  }

  async getJson(key: string) {
    return JSON.parse(await this.client.get(key));
  }
}
