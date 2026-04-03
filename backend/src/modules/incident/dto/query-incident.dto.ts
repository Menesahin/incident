import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../../../common/enums/status.enum';
import { Severity } from '../../../common/enums/severity.enum';
import { ServiceName } from '../../../common/enums/service-name.enum';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryIncidentDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ enum: Severity })
  @IsEnum(Severity)
  @IsOptional()
  severity?: Severity;

  @ApiPropertyOptional({ enum: ServiceName })
  @IsEnum(ServiceName)
  @IsOptional()
  service?: ServiceName;

  @ApiPropertyOptional({ description: 'Search in title and description' })
  @IsString()
  @IsOptional()
  search?: string;
}
