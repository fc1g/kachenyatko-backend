import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateProductInput } from './dto/create-product.input';
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

  @Query(() => [Product], { name: 'bestsellers' })
  findBestsellers(@Args('take', { type: () => Number }) take: number) {
    return this.productsService.findBestsellers(take);
  }

  @Query(() => [Product], { name: 'newest' })
  findNewest(@Args('take', { type: () => Number }) take: number) {
    return this.productsService.findNewest(take);
  }

  @Query(() => Product, { name: 'product' })
  findOne(@Args('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne({ id });
  }

  @Query(() => Product, { name: 'productBySku' })
  findOneBySku(@Args('sku', { type: () => String }) sku: string) {
    return this.productsService.findOne({ sku });
  }

  @Mutation(() => Product, { name: 'updateProduct' })
  updateProduct(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    return this.productsService.update(id, updateProductInput);
  }

  @Mutation(() => Boolean, { name: 'removeProduct' })
  removeProduct(@Args('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
