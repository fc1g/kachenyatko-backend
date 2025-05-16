import { ParseUUIDPipe } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CategoriesService } from './categories.service';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { Category } from './entities/category.entity';

@Resolver(() => Category)
export class CategoriesResolver {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Mutation(() => Category, { name: 'createCategory' })
  createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ) {
    return this.categoriesService.create(createCategoryInput);
  }

  @Query(() => [Category], { name: 'categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Query(() => Category, { name: 'category' })
  findOne(@Args('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne({ id });
  }

  @Mutation(() => Category, { name: 'updateCategory' })
  updateCategory(
    @Args('id', ParseUUIDPipe) id: string,
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ) {
    return this.categoriesService.update(id, updateCategoryInput);
  }

  @Mutation(() => Category, { name: 'removeCategory' })
  removeCategory(@Args('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
