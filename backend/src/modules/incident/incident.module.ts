import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Incident } from './entities/incident.entity';
import { IncidentTimeline } from './entities/incident-timeline.entity';
import { IncidentRepository } from './incident.repository';
import { IncidentTimelineService } from './incident-timeline.service';
import { IncidentEventProcessor } from './incident-event.processor';
import { IncidentEventDispatcher } from './incident-event.dispatcher';
import { IncidentService } from './incident.service';
import { IncidentStatsService } from './incident-stats.service';
import { IncidentController } from './incident.controller';
import { IncidentGateway } from './incident.gateway';
import { IncidentConsumer } from './incident.consumer';
import { INCIDENT_NOTIFIER } from './interfaces/incident-notifier.interface';
import { INCIDENT_QUEUE } from '../../common/enums/index';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident, IncidentTimeline]),
    BullModule.registerQueue({ name: INCIDENT_QUEUE }),
  ],
  controllers: [IncidentController],
  providers: [
    IncidentRepository,
    IncidentTimelineService,
    IncidentGateway,
    { provide: INCIDENT_NOTIFIER, useExisting: IncidentGateway },
    IncidentEventProcessor,
    IncidentEventDispatcher,
    IncidentService,
    IncidentStatsService,
    IncidentConsumer,
  ],
  exports: [IncidentService],
})
export class IncidentModule {}
