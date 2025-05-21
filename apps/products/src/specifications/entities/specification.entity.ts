import { AbstractEntity } from '@app/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Product } from '../../entities/product.entity';

@Entity('product_specifications')
@ObjectType()
export class Specification extends AbstractEntity<Specification> {
  @Column('varchar', { length: 100 })
  @Field(() => String)
  size: string;

  @Column('varchar', { name: 'age_group', length: 100 })
  @Field(() => String)
  ageGroup: string;

  @Column('varchar', { length: 100 })
  @Field(() => String)
  material: string;

  @Column('varchar', { name: 'package_size', length: 100 })
  @Field(() => String)
  packageSize: string;

  @OneToOne(() => Product, (product) => product.specification, {
    onDelete: 'CASCADE',
  })
  @Field(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
