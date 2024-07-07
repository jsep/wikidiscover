import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('feed/:lang/featured/:year/:month/:day')
  async getFeed(
    @Param('lang') lang: string,
    @Param('year') year: string,
    @Param('month') month: string,
    @Param('day') day: string,
  ): Promise<{ error: string | null; data: string | null }> {
    try {
      const data = await this.appService.getFeed({ lang, year, month, day });
      return { error: null, data };
    } catch (error) {
      return { error: error.message, data: null };
    }
  }
}
