import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RunImportDto {
  @ApiPropertyOptional({
    example: 'data/source',
    description: 'Relative or absolute directory containing teachers.csv, classes.csv, and students.csv',
  })
  @IsOptional()
  @IsString()
  sourceDir?: string;

  @ApiPropertyOptional({
    example: 'initial-import.json',
    description: 'Optional filename for saving the JSON report under data/reports/',
  })
  @IsOptional()
  @IsString()
  reportName?: string;
}