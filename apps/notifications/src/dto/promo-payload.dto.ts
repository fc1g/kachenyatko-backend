import { IsString } from 'class-validator';

export class PromoPayloadDto {
  @IsString()
  subject: string;

  @IsString()
  text: string;
}
