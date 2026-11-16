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
import { ClassesService } from './classes.service.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';

@ApiTags('Classes')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
@ApiForbiddenResponse({ description: 'Insufficient role permissions' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a class' })
  @ApiCreatedResponse({ description: 'Class created' })
  @ApiNotFoundResponse({ description: 'Assigned teacher not found' })
  @ApiConflictResponse({ description: 'Class name already exists' })
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'List all classes' })
  @ApiOkResponse({ description: 'List of classes' })
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.TEACHER, UserRole.STUDENT)
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiOkResponse({ description: 'Class details' })
  @ApiNotFoundResponse({ description: 'Class not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update a class' })
  @ApiOkResponse({ description: 'Class updated' })
  @ApiNotFoundResponse({ description: 'Class or teacher not found' })
  @ApiConflictResponse({
    description: 'Duplicate class name or capacity below enrolled student count',
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a class (Admin only)' })
  @ApiOkResponse({ description: 'Class deleted' })
  @ApiNotFoundResponse({ description: 'Class not found' })
  @ApiConflictResponse({ description: 'Class still has enrolled students' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.classesService.remove(id);
  }
}
