import { JwtAuthGuard, ROLE_NAME, Roles } from '@app/common';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotifyEmailDto } from './dto/notify-email.dto';
import { SubscriptionDto } from './dto/subscription.dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('subscribe')
  async subscribeToNewsletter(@Body() body: SubscriptionDto) {
    return this.notificationsService.subscribeToNewsletter(body);
  }

  @Post('unsubscribe')
  async unsubscribeFromNewsletter(@Body() body: SubscriptionDto) {
    return this.notificationsService.unsubscribeFromNewsletter(body);
  }

  @Get('send-promo')
  @UseGuards(JwtAuthGuard)
  @Roles(ROLE_NAME.ADMIN, ROLE_NAME.MODERATOR)
  async sendPromo() {
    return this.notificationsService.sendPromo();
  }

  // TODO: remove this
  @EventPattern('notify_email')
  async notifyEmail(@Payload() data: NotifyEmailDto) {
    return this.notificationsService.notifyEmail(data);
  }
}
