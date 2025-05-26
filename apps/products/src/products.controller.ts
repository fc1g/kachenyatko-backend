import { JwtAuthGuard } from '@app/common';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller()
export class ProductsController {
  constructor() {}

  @Get('greet')
  @UseGuards(JwtAuthGuard)
  greet() {
    return 'Hello World';
  }
}
