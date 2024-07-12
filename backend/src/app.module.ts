import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { WikipediaService } from './wikipedia.service';
import { TranslateService } from './translate.service';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './cache.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [WikipediaService, TranslateService, CacheService],
})
export class AppModule {}
