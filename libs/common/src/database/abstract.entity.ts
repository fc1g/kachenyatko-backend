import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // constructor(entity: Partial<T>) {
  //   Object.assign(this, entity);
  // }
}
