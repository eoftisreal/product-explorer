import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaywrightCrawler } from 'crawlee';
import { Navigation } from './entities/navigation.entity';
import { Category } from '../categories/entities/category.entity';

interface SubCategory {
  title: string;
  slug: string;
}

interface MenuData {
  title: string;
  slug: string;
  categories: SubCategory[];
}

@Injectable()
export class NavigationService {
  private readonly logger = new Logger(NavigationService.name);

  constructor(
    @InjectRepository(Navigation)
    private navRepository: Repository<Navigation>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async scrapeNavigation() {
    this.logger.log('Starting Navigation Scrape...');

    try {
      const crawler = new PlaywrightCrawler({
        headless: true,
        requestHandler: async ({ page, log }) => {
          log.info('Visiting World of Books...');
          await page.goto('https://www.worldofbooks.com/en-gb', {
            waitUntil: 'domcontentloaded',
          });
          await page
            .waitForSelector('.site-nav__item', { timeout: 10000 })
            .catch(() => null);

          // Extract Headings and their Sub-Categories
          const menuData = await page.evaluate((): MenuData[] => {
            const results: MenuData[] = [];
            document.querySelectorAll('.site-nav__item').forEach((navItem) => {
              const titleEl = navItem.querySelector('.site-nav__link');
              const title = titleEl?.textContent?.trim();
              const slug = titleEl?.getAttribute('href');

              if (title && slug) {
                const subCats: SubCategory[] = [];
                navItem
                  .querySelectorAll('.site-nav__dropdown-link')
                  .forEach((sub) => {
                    const subTitle = sub.textContent?.trim();
                    const subSlug = sub.getAttribute('href');
                    if (subTitle && subSlug) {
                      subCats.push({
                        title: subTitle,
                        slug: subSlug,
                      });
                    }
                  });
                results.push({ title, slug, categories: subCats });
              }
            });
            return results;
          });

          // Save to Database
          for (const item of menuData) {
            // 1. Save Heading (Navigation)
            let nav = await this.navRepository.findOne({
              where: { slug: item.slug },
            });
            if (!nav) {
              nav = this.navRepository.create({
                title: item.title,
                slug: item.slug,
              });
              await this.navRepository.save(nav);
              log.info(`Saved Navigation: ${item.title}`);
            }

            // 2. Save Sub-Categories
            for (const cat of item.categories) {
              if (cat.title && cat.slug) {
                const exists = await this.categoryRepository.findOne({
                  where: { slug: cat.slug },
                });
                if (!exists) {
                  await this.categoryRepository.save({
                    title: cat.title,
                    slug: cat.slug,
                    navigation: nav,
                  });
                }
              }
            }
          }
        },
      });

      await crawler.run(['https://www.worldofbooks.com/en-gb']);
      return { message: 'Navigation & Categories scraped successfully!' };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(err);
      return { error: err.message };
    }
  }

  findAll() {
    return this.navRepository.find({ relations: ['categories'] });
  }
}
