import { Injectable } from '@nestjs/common';
import { ImagesRepository } from './images.repository';

@Injectable()
export class ImagesService {
  constructor(private readonly repo: ImagesRepository) {}

  async findOne(id: string) {
    return this.repo.findOne({ id }, `Image not found. With id: ${id}`, {
      relations: { product: true },
    });
  }
}
