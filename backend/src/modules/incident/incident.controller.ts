import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { IncidentService } from './incident.service.js';
import { CreateIncidentDto } from './dto/create-incident.dto.js';
import { UpdateIncidentDto } from './dto/update-incident.dto.js';
import { QueryIncidentDto } from './dto/query-incident.dto.js';
import { IncidentResponseDto } from './dto/incident-response.dto.js';
import { Severity } from '../../common/enums/severity.enum.js';
import { Status } from '../../common/enums/status.enum.js';
import { ServiceName } from '../../common/enums/service-name.enum.js';

@ApiTags('Incidents')
@Controller('incidents')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new incident' })
  @ApiBody({ type: CreateIncidentDto })
  @ApiResponse({
    status: 201,
    description: 'Incident created successfully',
    type: IncidentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() dto: CreateIncidentDto) {
    return this.incidentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List incidents with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'status', required: false, enum: Status })
  @ApiQuery({ name: 'severity', required: false, enum: Severity })
  @ApiQuery({ name: 'service', required: false, enum: ServiceName })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated incident list' })
  async findAll(@Query() query: QueryIncidentDto) {
    return this.incidentService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get incident statistics' })
  @ApiResponse({
    status: 200,
    description: 'Incident statistics by status and severity',
  })
  async getStats() {
    return this.incidentService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident by ID with timeline' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Incident with timeline',
    type: IncidentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.incidentService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an incident' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateIncidentDto })
  @ApiResponse({
    status: 200,
    description: 'Updated incident',
    type: IncidentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  @ApiResponse({ status: 409, description: 'Version conflict' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an incident' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Incident deleted' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.incidentService.remove(id);
  }
}
