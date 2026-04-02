import { AnimatePresence } from 'framer-motion';
import { IncidentCard } from './IncidentCard';
import { IncidentEmptyState } from './IncidentEmptyState';
import type { Incident } from '../types/incident';

interface IncidentListProps {
  incidents: Incident[];
}

export function IncidentList({ incidents }: IncidentListProps) {
  if (incidents.length === 0) {
    return <IncidentEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {incidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
