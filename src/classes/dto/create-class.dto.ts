import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'Grade 10 - A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 25, minimum: 1 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 'b1f4c12a-7e3b-4d40-9e08-8f3e3b4e9123' })
  @IsUUID()
  teacherId: string;
}