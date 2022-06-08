import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';

export enum UserGender {
  Male = 'Male',
  Female = 'Female',
}
export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsInt()
  age: number;

  @ApiProperty({ enum: UserGender, default: UserGender.Male })
  @IsEnum(UserGender)
  gender: UserGender;
}
