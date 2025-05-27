import { SERVICE } from '@app/common';
import { StatusResponseDto } from '@app/common/dto/status-response.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NotifyEmailDto } from 'apps/notifications/src/dto/notify-email.dto';
import { plainToClass } from 'class-transformer';
import { FindOptionsWhere, In, Not } from 'typeorm';
import { CategoriesService } from './categories/categories.service';
import { Category } from './categories/entities/category.entity';
import { CreateProductInput } from './dto/create-product.input';
import { PaginationOptionsInput } from './dto/pagination-options.input';
import { ProductMetadataInput } from './dto/product-metadata.input';
import { ProductStaticParamInput } from './dto/product-static-param.input';
import { ProductsWithCountInput } from './dto/products-with-count.input';
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
    @Inject(SERVICE.NOTIFICATIONS)
    private readonly notificationsClient: ClientProxy,
  ) {}

  testNotifyEmail(notifyEmailDto: NotifyEmailDto) {
    return this.notificationsClient.emit('notify_email', notifyEmailDto);
  }

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
      productInput.categoryIds.map((id) => this.validateCategory(id)),
    ).then((categories) => categories.filter((category) => category !== null));

    const product = plainToClass(Product, {
      ...productInput,
      slug,
      sku,
      categories,
    });

    return this.repo.create(product);
  }

  private async validateCategory(categoryId: string): Promise<Category | null> {
    try {
      const category = await this.categoriesService.findOne({ id: categoryId });

      return category;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async find({
    take,
    skip,
    sort,
    categoryIds,
  }: PaginationOptionsInput): Promise<ProductsWithCountInput> {
    const [items, total] = await this.repo.findAllWithCount({
      order: {
        createdAt: sort,
      },
      take,
      skip,
      where: {
        categories: {
          id: categoryIds.length > 0 ? In(categoryIds) : undefined,
        },
      },
      relations: {
        images: true,
        categories: true,
      },
    });

    return {
      items,
      total,
    };
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

  async otherProducts(id: string, take: number): Promise<Product[]> {
    const product = await this.findOne({ id });

    if (product.categories.length === 0) {
      return [];
    }

    const categoryIds = product.categories.map((category) => category.id);

    return this.repo.findAll({
      where: {
        id: Not(id),
        categories: {
          id: In(categoryIds),
        },
      },
      take,
      relations: {
        images: true,
        categories: true,
      },
    });
  }

  async staticParams(): Promise<ProductStaticParamInput[]> {
    return this.repo.findAll({
      select: {
        id: true,
        slug: true,
      },
    });
  }

  async findOne(where: FindOptionsWhere<Product>): Promise<Product> {
    return this.repo.findOne(where, 'Product', {
      order: { images: { position: 'ASC' } },
      relations: {
        images: true,
        details: true,
        specification: true,
        categories: true,
      },
    });
  }

  async metadata(id: string): Promise<ProductMetadataInput> {
    return this.repo.findOne({ id }, 'Product', {
      relations: {
        images: true,
        categories: true,
      },
    });
  }

  // HACK:
  async update(
    id: string,
    updateProductInput: UpdateProductInput,
  ): Promise<Product> {
    return this.repo.findOneAndUpdate({ id }, 'Product', {
      ...updateProductInput,
    });
  }

  async remove(id: string): Promise<StatusResponseDto> {
    try {
      await this.repo.findOneAndDelete({ id }, 'Product');
      return { statusCode: 204, message: 'Product deleted successfully' };
    } catch (error) {
      this.logger.error(error);
      return { statusCode: 500, message: 'Failed to delete product' };
    }
  }
}
