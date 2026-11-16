import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'Omar Adel' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({ example: 'omar.adel@student.school.local' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'd9b3f201-5f4a-4e82-9a12-7c9a6a7d3210' })
  @IsUUID()
  classId: string;
}