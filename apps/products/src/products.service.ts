import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { FindOptionsWhere } from 'typeorm';
import { CategoriesService } from './categories/categories.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { Product } from './entities/product.entity';
import { ProductsRepository } from './products.repository';
import { generateSlug } from './utils/generate-slug';

@Injectable()
export class ProductsService {
  protected readonly logger = new Logger(ProductsService.name);
  constructor(
    private readonly repo: ProductsRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(productInput: CreateProductInput): Promise<Product> {
    const slug = generateSlug({
      name: productInput.name,
      size: productInput.specification?.size,
      material: productInput.specification?.material,
      ageGroup: productInput.specification?.ageGroup,
    });
    const sku = generateSlug({
      name: productInput.name,
      size: productInput.specification?.size,
      withRandomSuffix: true,
    });

    const categories = await Promise.all(
      productInput.categoryIds.map((id) =>
        this.categoriesService.findOne({ id }),
      ),
    );

    const product = plainToClass(Product, {
      ...productInput,
      slug,
      sku,
      categories,
    });

    return this.repo.create(product);
  }

  async findBestsellers(take: number): Promise<Product[]> {
    return this.repo.findAll({
      order: {
        totalSold: 'DESC',
      },
      take,
      relations: {
        images: true,
      },
    });
  }

  async findNewest(take: number): Promise<Product[]> {
    return this.repo.findAll({
      order: {
        createdAt: 'DESC',
      },
      take,
      relations: {
        images: true,
      },
    });
  }

  async findOne(where: FindOptionsWhere<Product>): Promise<Product> {
    return this.repo.findOne(
      where,
      `Product not found with where: ${JSON.stringify(where)}`,
      {
        order: { images: { position: 'ASC' } },
        relations: {
          images: true,
          details: true,
          specification: true,
          categories: true,
        },
      },
    );
  }

  async update(
    id: string,
    updateProductInput: UpdateProductInput,
  ): Promise<Product> {
    return this.repo.findOneAndUpdate({ id }, { ...updateProductInput });
  }

  async remove(id: string): Promise<boolean> {
    try {
      await this.repo.findOneAndDelete({ id });
      return true;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to delete product');
    }
  }
}
