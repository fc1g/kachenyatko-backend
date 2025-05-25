import { StatusResponseDto } from '@app/common/dto/status-response.dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProductInput } from './dto/create-product.input';
import { PaginationOptionsInput } from './dto/pagination-options.input';
import { ProductMetadataInput } from './dto/product-metadata.input';
import { ProductStaticParamInput } from './dto/product-static-param.input';
import { ProductsWithCountInput } from './dto/products-with-count.input';
import { UpdateProductInput } from './dto/update-product.input';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Mutation(() => Product, { name: 'createProduct' })
  createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ) {
    return this.productsService.create(createProductInput);
  }

  @Query(() => ProductsWithCountInput, { name: 'products' })
  find(
    @Args('options', { type: () => PaginationOptionsInput })
    options: PaginationOptionsInput,
  ) {
    return this.productsService.find(options);
  }

  @Query(() => [Product], { name: 'bestsellers' })
  findBestsellers(@Args('take', { type: () => Number }) take: number) {
    return this.productsService.findBestsellers(take);
  }

  @Query(() => [Product], { name: 'newest' })
  findNewest(@Args('take', { type: () => Number }) take: number) {
    return this.productsService.findNewest(take);
  }

  @Query(() => [Product], { name: 'otherProducts' })
  otherProducts(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('take', { type: () => Number }) take: number,
  ) {
    return this.productsService.otherProducts(id, take);
  }

  @Query(() => [ProductStaticParamInput], { name: 'productStaticParams' })
  staticParams() {
    return this.productsService.staticParams();
  }

  @Query(() => Product, { name: 'product' })
  findOne(@Args('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne({ id });
  }

  @Query(() => Product, { name: 'productBySku' })
  findOneBySku(@Args('sku', { type: () => String }) sku: string) {
    return this.productsService.findOne({ sku });
  }

  @Query(() => ProductMetadataInput, { name: 'productMetadata' })
  productMetadata(@Args('id', ParseUUIDPipe) id: string) {
    return this.productsService.metadata(id);
  }

  // HACK:
  @Mutation(() => Product, { name: 'updateProduct' })
  updateProduct(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    return this.productsService.update(id, updateProductInput);
  }

  @Mutation(() => StatusResponseDto, { name: 'removeProduct' })
  removeProduct(@Args('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
