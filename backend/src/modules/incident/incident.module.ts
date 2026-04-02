import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Incident } from './entities/incident.entity.js';
import { IncidentTimeline } from './entities/incident-timeline.entity.js';
import { IncidentRepository } from './incident.repository.js';
import { IncidentService } from './incident.service.js';
import { IncidentController } from './incident.controller.js';
import { IncidentGateway } from './incident.gateway.js';
import { IncidentConsumer } from './incident.consumer.js';
import { INCIDENT_QUEUE } from '../../common/enums/index.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident, IncidentTimeline]),
    BullModule.registerQueue({ name: INCIDENT_QUEUE }),
  ],
  controllers: [IncidentController],
  providers: [
    IncidentRepository,
    IncidentService,
    IncidentGateway,
    IncidentConsumer,
  ],
  exports: [IncidentService],
})
export class IncidentModule {}
