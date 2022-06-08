import { ApiProperty } from '@nestjs/swagger';
import { ApiQuery } from '@nestjs/swagger';

export class GetUserDto {
  @ApiProperty({ required: true, default: 2 })
  limit: number;
  @ApiProperty({ required: true, default: 1 })
  page: number;
}
