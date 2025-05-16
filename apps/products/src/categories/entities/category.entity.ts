import { AbstractEntity } from '@app/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, Index, ManyToMany } from 'typeorm';
import { Product } from '../../entities/product.entity';

@Entity({ name: 'product_category' })
@Index(['slug'], { unique: true })
@ObjectType()
export class Category extends AbstractEntity<Category> {
  @Column('varchar', { length: 100 })
  @Field(() => String)
  name: string;

  @Column('varchar', { length: 100 })
  @Field(() => String)
  slug: string;

  @ManyToMany(() => Product, (product) => product.categories)
  @Field(() => [Product])
  products: Product[];
}
