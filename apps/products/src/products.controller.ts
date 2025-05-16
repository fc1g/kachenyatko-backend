import { Controller, Get } from '@nestjs/common';

@Controller()
export class ProductsController {
  @Get('healthz')
  health() {
    return {
      status: 'ok',
    };
  }
}
