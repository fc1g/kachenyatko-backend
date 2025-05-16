import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { FindOptionsWhere } from 'typeorm';
import { generateSlug } from '../utils/generate-slug';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
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
    return this.repo.findOne(
      where,
      `Category not found. With ${JSON.stringify(where)}`,
      {
        relations: { products: true },
      },
    );
  }

  async update(id: string, updateCategoryInput: UpdateCategoryInput) {
    const { name, slug: customSlug } = updateCategoryInput;

    const slug = customSlug
      ? generateSlug({ name: '', customSlug })
      : generateSlug({ name: name! });

    return this.repo.findOneAndUpdate({ id }, { ...updateCategoryInput, slug });
  }

  async remove(id: string) {
    return this.repo.findOneAndDelete({ id });
  }
}
