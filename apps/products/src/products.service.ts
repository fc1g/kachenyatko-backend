import { formatNotFound } from '@app/common';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { In, Not } from 'typeorm';
import { CategoriesService } from './categories/categories.service';
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

  async staticParams(): Promise<ProductStaticParamInput[]> {
    return this.repo.findAll({
      select: {
        id: true,
        slug: true,
      },
    });
  }

  async metadata(id: string): Promise<ProductMetadataInput> {
    const errorMessage = formatNotFound('Product', 'id', id);

    return this.repo.findOne({ id }, errorMessage, {
      relations: {
        images: true,
      },
    });
  }

  async findOne(id: string): Promise<Product> {
    const errorMessage = formatNotFound('Product', 'id', id);

    return this.repo.findOne({ id }, errorMessage, {
      order: { images: { position: 'ASC' } },
      relations: {
        images: true,
        details: true,
        specification: true,
        categories: true,
      },
    });
  }

  async otherProducts(id: string, take: number): Promise<Product[]> {
    const product = await this.findOne(id);

    const categoryIds = product.categories.map((category) => category.id);
    if (categoryIds.length === 0) {
      return [];
    }

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

  async findOneBySku(sku: string): Promise<Product> {
    const errorMessage = formatNotFound('Product', 'sku', sku);

    return this.repo.findOne({ sku }, errorMessage, {
      order: { images: { position: 'ASC' } },
      relations: {
        images: true,
        details: true,
        specification: true,
        categories: true,
      },
    });
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
