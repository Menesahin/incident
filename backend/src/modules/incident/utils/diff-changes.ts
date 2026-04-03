import { Incident } from '../entities/incident.entity';
import { UpdateIncidentDto } from '../dto/update-incident.dto';
import { ChangeEntry } from '../../../common/interfaces/change-entry.interface';

const DIFFABLE_FIELDS = [
  'status',
  'severity',
  'description',
] as const satisfies ReadonlyArray<keyof UpdateIncidentDto & keyof Incident>;

export function diffChanges(
  existing: Incident,
  dto: UpdateIncidentDto,
): ChangeEntry[] {
  const changes: ChangeEntry[] = [];

  for (const field of DIFFABLE_FIELDS) {
    const newVal = dto[field];
    if (newVal !== undefined && newVal !== existing[field]) {
      changes.push({
        field,
        previousValue: existing[field] ?? null,
        newValue: newVal,
      });
    }
  }

  return changes;
}
