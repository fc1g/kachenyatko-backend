import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CategoriesResolver } from './categories.resolver';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

@Module({
  imports: [DatabaseModule.forFeature([Category])],
  providers: [CategoriesService, CategoriesRepository, CategoriesResolver],
  exports: [CategoriesService],
})
export class CategoriesModule {}
