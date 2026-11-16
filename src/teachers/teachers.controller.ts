import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { TeachersService } from './teachers.service.js';

@ApiTags('Teachers')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@ApiForbiddenResponse({ description: 'Insufficient role permissions' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a teacher' })
  @ApiCreatedResponse({ description: 'Teacher created' })
  @ApiConflictResponse({ description: 'Teacher email already exists' })
  create(@Body() dto: CreateTeacherDto) {
    return this.teachersService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'List all teachers' })
  @ApiOkResponse({ description: 'List of teachers' })
  findAll() {
    return this.teachersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get a teacher by ID' })
  @ApiOkResponse({ description: 'Teacher details' })
  @ApiNotFoundResponse({ description: 'Teacher not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update a teacher' })
  @ApiOkResponse({ description: 'Teacher updated' })
  @ApiNotFoundResponse({ description: 'Teacher not found' })
  @ApiConflictResponse({ description: 'Teacher email already exists' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTeacherDto) {
    return this.teachersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a teacher (Admin only)' })
  @ApiOkResponse({ description: 'Teacher deleted' })
  @ApiNotFoundResponse({ description: 'Teacher not found' })
  @ApiConflictResponse({ description: 'Teacher still has assigned classes' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teachersService.remove(id);
  }
}
