import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IncidentTimeline } from './entities/incident-timeline.entity';
import { TimelineAction } from '../../common/enums/index';
import { ChangeEntry } from '../../common/interfaces/change-entry.interface';

@Injectable()
export class IncidentTimelineService {
  private static readonly FIELD_ACTION_MAP: ReadonlyMap<
    string,
    TimelineAction
  > = new Map([
    ['status', TimelineAction.STATUS_CHANGED],
    ['severity', TimelineAction.SEVERITY_CHANGED],
    ['description', TimelineAction.DESCRIPTION_CHANGED],
  ]);

  constructor(
    @InjectRepository(IncidentTimeline)
    private readonly timelineRepo: Repository<IncidentTimeline>,
  ) {}

  resolveAction(field: string): TimelineAction {
    return (
      IncidentTimelineService.FIELD_ACTION_MAP.get(field) ??
      TimelineAction.CREATED
    );
  }

  async recordCreated(incidentId: string): Promise<void> {
    await this.timelineRepo.save({
      incidentId,
      action: TimelineAction.CREATED,
    });
  }

  async recordChanges(
    incidentId: string,
    changes: ChangeEntry[],
  ): Promise<void> {
    for (const change of changes) {
      await this.timelineRepo.save({
        incidentId,
        action: this.resolveAction(change.field),
        field: change.field,
        previousValue: change.previousValue,
        newValue: change.newValue,
      });
    }
  }

  async recordDeleted(incidentId: string): Promise<void> {
    await this.timelineRepo.save({
      incidentId,
      action: TimelineAction.DELETED,
    });
  }
}
