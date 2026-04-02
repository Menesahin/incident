import { IsString, IsNotEmpty, MaxLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Severity } from '../../../common/enums/severity.enum.js';
import { ServiceName } from '../../../common/enums/service-name.enum.js';
import { MAX_TITLE_LENGTH } from '../../../common/constants/index.js';

export class CreateIncidentDto {
  @ApiProperty({ example: 'Payment gateway timeout', maxLength: MAX_TITLE_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_TITLE_LENGTH)
  title!: string;

  @ApiPropertyOptional({ example: 'Stripe API returning 504 errors for 10% of requests' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ServiceName, example: ServiceName.PAYMENT_API })
  @IsEnum(ServiceName)
  service!: ServiceName;

  @ApiProperty({ enum: Severity, example: Severity.HIGH })
  @IsEnum(Severity)
  severity!: Severity;
}
