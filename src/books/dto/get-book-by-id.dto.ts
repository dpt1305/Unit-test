import { IsEnum, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SortType {
  'ASC' = 'asc',
  'DESC' = 'desc',
}
export class GetBookByIdDto {
  @IsEnum(SortType)
  @ApiProperty({ enum: SortType, default: SortType.ASC })
  sort: SortType;

  @ApiProperty({ required: true, default: 2 })
  @IsNumber()
  limit: number;

  @ApiProperty({ required: false })
  @IsNumber()
  startAfter: number;
}
