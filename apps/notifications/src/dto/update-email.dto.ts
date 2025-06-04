import { PartialType } from '@nestjs/mapped-types';
import { SubscriptionDto } from './subscription.dto';

export class UpdateEmailDto extends PartialType(SubscriptionDto) {}
