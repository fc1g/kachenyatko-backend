import { Injectable } from '@nestjs/common';
import { SpecificationsRepository } from './specifications.repository';

@Injectable()
export class SpecificationsService {
  constructor(private readonly repo: SpecificationsRepository) {}

  async findOne(id: string) {
    return this.repo.findOne(
      { id },
      `Specification not found. With id: ${id}`,
      {
        relations: { product: true },
      },
    );
  }
}
