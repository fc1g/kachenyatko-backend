import { JwtAuthGuard } from '@app/common';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { NotifyEmailDto } from 'apps/notifications/src/dto/notify-email.dto';
import { ProductsService } from './products.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('greet')
  greet() {
    return 'Hello World';
  }

  @Post('test-notify-email')
  testNotifyEmail(@Body() body: NotifyEmailDto) {
    return this.productsService.testNotifyEmail(body);
  }
}
