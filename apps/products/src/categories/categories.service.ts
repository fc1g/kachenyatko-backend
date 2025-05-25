import { StatusResponseDto } from '@app/common/dto/status-response.dto';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { FindOptionsWhere } from 'typeorm';
import { generateSlug } from '../utils/generate-slug';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  protected readonly logger = new Logger(CategoriesService.name);
  constructor(private readonly repo: CategoriesRepository) {}

  async create(createCategoryInput: CreateCategoryInput) {
    const slug = generateSlug({ ...createCategoryInput });
    const category = plainToClass(Category, {
      ...createCategoryInput,
      slug,
    });
    return this.repo.create(category);
  }

  async findAll() {
    return this.repo.findAll({ relations: { products: true } });
  }

  async findOne(where: FindOptionsWhere<Category>) {
    return this.repo.findOne(where, 'Category', {
      relations: { products: true },
    });
  }

  async update(id: string, updateCategoryInput: UpdateCategoryInput) {
    const slug = generateSlug({
      name: updateCategoryInput.name || '',
      customSlug: updateCategoryInput.slug || '',
    });

    return this.repo.findOneAndUpdate({ id }, 'Category', {
      ...updateCategoryInput,
      slug,
    });
  }

  async remove(id: string): Promise<StatusResponseDto> {
    try {
      await this.repo.findOneAndDelete({ id }, 'Category');
      return { statusCode: 204, message: 'Category deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
}
