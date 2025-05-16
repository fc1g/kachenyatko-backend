import { AbstractEntity } from '@app/common';
import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Detail } from '../details/entities/detail.entity';
import { Image } from '../images/entities/image.entity';
import { Specification } from '../specifications/entities/specification.entity';

@Entity({ name: 'products' })
@Index(['slug', 'sku'], { unique: true })
@ObjectType()
export class Product extends AbstractEntity<Product> {
  @Column('varchar', { length: 100 })
  @Field(() => String)
  name: string;

  @Column('varchar', { length: 100, unique: true })
  @Field(() => String)
  slug: string;

  @Column('varchar', { length: 64, unique: true })
  @Field(() => String)
  sku: string;

  @Column('text', { array: true })
  @Field(() => [String])
  colors: string[];

  @Column('varchar', { name: 'short_description', length: 120 })
  @Field(() => String)
  shortDescription: string;

  @Column('text', { name: 'full_description' })
  @Field(() => String)
  fullDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  @Field(() => Number)
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @Field(() => Number)
  discount: number;

  @Column('int', { default: 0 })
  @Field(() => Number)
  stock: number;

  @Column('int', { name: 'total_sold', default: 0 })
  @Field(() => Number)
  totalSold: number;

  @OneToMany(() => Image, (image) => image.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Field(() => [Image])
  images: Image[];

  @OneToMany(() => Detail, (detail) => detail.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Field(() => [Detail])
  details: Detail[];

  @OneToOne(() => Specification, (specification) => specification.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Field(() => Specification)
  specification: Specification;

  @ManyToMany(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  @Field(() => [Category])
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];

  @Field(() => String)
  get formattedPrice(): string {
    const totalPrice = Number(this.price) - Number(this.discount ?? 0);
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
    })
      .format(totalPrice)
      .replace('₴', 'грн');
  }

  @Field(() => String, { nullable: true })
  get formattedOldPrice(): string | null {
    if (!this.discount || Number(this.discount) <= 0) return null;

    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
    })
      .format(Number(this.price))
      .replace('₴', 'грн');
  }
}
