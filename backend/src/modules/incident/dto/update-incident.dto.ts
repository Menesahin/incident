import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '../../../common/enums/status.enum';
import { Severity } from '../../../common/enums/severity.enum';

export class UpdateIncidentDto {
  @ApiPropertyOptional({ enum: Status, example: Status.INVESTIGATING })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiPropertyOptional({ enum: Severity, example: Severity.CRITICAL })
  @IsEnum(Severity)
  @IsOptional()
  severity?: Severity;

  @ApiPropertyOptional({ example: 'Updated description after investigation' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Current version for optimistic locking',
    example: 1,
  })
  @IsNumber()
  version!: number;
}
