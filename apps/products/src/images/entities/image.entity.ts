import { AbstractEntity } from '@app/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Product } from '../../entities/product.entity';

@Entity('product_images')
@ObjectType()
export class Image extends AbstractEntity<Image> {
  @Column('text')
  @Field(() => String)
  url: string;

  @Column('varchar', { name: 'alt_text', length: 255 })
  @Field(() => String)
  altText: string;

  @Column('int', { default: 1 })
  @Field(() => Number)
  position: number;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @Field(() => Product)
  product: Product;
}
