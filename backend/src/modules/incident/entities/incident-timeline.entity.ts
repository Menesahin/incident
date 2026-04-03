import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { TimelineAction } from '../../../common/enums/timeline-action.enum';
import { Incident } from './incident.entity';

@Entity('incident_timelines')
@Index(['incidentId', 'createdAt'])
export class IncidentTimeline {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'enum', enum: TimelineAction })
  action!: TimelineAction;

  @Column({ type: 'varchar', nullable: true })
  field!: string | null;

  @Column({ type: 'varchar', nullable: true })
  previousValue!: string | null;

  @Column({ type: 'varchar', nullable: true })
  newValue!: string | null;

  @Column({ type: 'uuid' })
  incidentId!: string;

  @ManyToOne(() => Incident, (i) => i.timelines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'incidentId' })
  incident!: Incident;
}
