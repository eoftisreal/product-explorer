import { Controller, Get, Post } from '@nestjs/common';
import { NavigationService } from './navigation.service';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post('scrape')
  scrape() {
    return this.navigationService.scrapeNavigation();
  }

  @Get()
  findAll() {
    return this.navigationService.findAll();
  }
}