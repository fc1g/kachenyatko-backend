import { Injectable } from '@nestjs/common';
import { DetailsRepository } from './details.repository';

@Injectable()
export class DetailsService {
  constructor(private readonly repo: DetailsRepository) {}

  async findOne(id: string) {
    return this.repo.findOne({ id }, `Detail not found. With id: ${id}`, {
      relations: { product: true },
    });
  }
}
