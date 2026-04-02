import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Severity } from '../../../common/enums/severity.enum.js';
import { Status } from '../../../common/enums/status.enum.js';
import { ServiceName } from '../../../common/enums/service-name.enum.js';

export class TimelineResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  action!: string;

  @ApiPropertyOptional()
  field!: string | null;

  @ApiPropertyOptional()
  previousValue!: string | null;

  @ApiPropertyOptional()
  newValue!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class IncidentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Payment gateway timeout' })
  title!: string;

  @ApiPropertyOptional({ example: 'Stripe API returning 504 errors' })
  description!: string | null;

  @ApiProperty({ enum: ServiceName })
  service!: ServiceName;

  @ApiProperty({ enum: Severity })
  severity!: Severity;

  @ApiProperty({ enum: Status })
  status!: Status;

  @ApiProperty()
  version!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: [TimelineResponseDto] })
  timelines?: TimelineResponseDto[];
}
