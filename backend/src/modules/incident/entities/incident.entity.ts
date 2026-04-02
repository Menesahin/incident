import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity.js';
import { Severity } from '../../../common/enums/severity.enum.js';
import { Status } from '../../../common/enums/status.enum.js';
import { ServiceName } from '../../../common/enums/service-name.enum.js';
import { IncidentTimeline } from './incident-timeline.entity.js';

@Entity('incidents')
@Index(['status', 'createdAt'])
@Index(['severity'])
@Index(['service'])
export class Incident extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: ServiceName })
  service!: ServiceName;

  @Column({ type: 'enum', enum: Severity })
  severity!: Severity;

  @Column({ type: 'enum', enum: Status, default: Status.OPEN })
  status!: Status;

  @OneToMany(() => IncidentTimeline, (t) => t.incident, {
    cascade: false,
  })
  timelines!: IncidentTimeline[];
}
