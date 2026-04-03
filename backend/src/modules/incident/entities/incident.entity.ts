import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Severity } from '../../../common/enums/severity.enum';
import { Status } from '../../../common/enums/status.enum';
import { ServiceName } from '../../../common/enums/service-name.enum';
import { IncidentTimeline } from './incident-timeline.entity';

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
