import { AbstractEntity } from '@app/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Product } from '../../entities/product.entity';

@Entity({ name: 'product_details' })
@ObjectType()
export class Detail extends AbstractEntity<Detail> {
  @Column('varchar', { length: 100 })
  @Field(() => String)
  key: string;

  @Column('varchar', { length: 100 })
  @Field(() => String)
  value: string;

  @ManyToOne(() => Product, (product) => product.details, {
    onDelete: 'CASCADE',
  })
  @Field(() => Product)
  product: Product;
}
