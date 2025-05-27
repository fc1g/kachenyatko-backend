import { IsEmail } from 'class-validator';

export class SubscriptionDto {
  @IsEmail()
  email: string;
}
