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
  ): Promise<{ error: string | null; data: any }> {
    const result = await this.appService.getFeed({ lang, year, month, day });
    return {
      error: result.error ? result.error.message : null,
      data: result.value,
    };
  }
}
