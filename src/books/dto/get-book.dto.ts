import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
export class GetBookDto {
  @ApiProperty({ required: true, default: 2 })
  @IsNumber()
  limit: number;

  @ApiProperty({ required: false })
  @IsNumber()
  startAfter?: number;
}
