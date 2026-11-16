import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({ example: 'Dr. Nadia Mansour' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'nadia.mansour@school.local' })
  @IsEmail()
  @MaxLength(255)
  email: string;
}