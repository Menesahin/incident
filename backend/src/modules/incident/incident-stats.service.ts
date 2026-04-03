import { Injectable } from '@nestjs/common';
import { IncidentRepository } from './incident.repository';

export interface IncidentStats {
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  total: number;
}

@Injectable()
export class IncidentStatsService {
  constructor(private readonly incidentRepo: IncidentRepository) {}

  async getStats(): Promise<IncidentStats> {
    const statusCounts = await this.incidentRepo
      .createQueryBuilder('incident')
      .select('incident.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.status')
      .getRawMany<{ status: string; count: string }>();

    const severityCounts = await this.incidentRepo
      .createQueryBuilder('incident')
      .select('incident.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.severity')
      .getRawMany<{ severity: string; count: string }>();

    return {
      byStatus: statusCounts.reduce(
        (acc, row) => {
          acc[row.status] = Number(row.count);
          return acc;
        },
        {} as Record<string, number>,
      ),
      bySeverity: severityCounts.reduce(
        (acc, row) => {
          acc[row.severity] = Number(row.count);
          return acc;
        },
        {} as Record<string, number>,
      ),
      total: statusCounts.reduce((sum, row) => sum + Number(row.count), 0),
    };
  }
}
