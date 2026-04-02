import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, SelectQueryBuilder } from 'typeorm';
import { Incident } from './entities/incident.entity.js';
import { QueryIncidentDto } from './dto/query-incident.dto.js';

const SORT_WHITELIST: Record<string, string> = {
  createdAt: 'incident.createdAt',
  updatedAt: 'incident.updatedAt',
  severity: 'incident.severity',
  status: 'incident.status',
  title: 'incident.title',
};

@Injectable()
export class IncidentRepository {
  constructor(
    @InjectRepository(Incident)
    private readonly repo: Repository<Incident>,
  ) {}

  async save(data: DeepPartial<Incident>): Promise<Incident> {
    return this.repo.save(data);
  }

  async findOneById(id: string): Promise<Incident | null> {
    return this.repo.findOne({ where: { id } });
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<Incident> {
    return this.repo.createQueryBuilder(alias);
  }

  async findWithFilters(
    query: QueryIncidentDto,
  ): Promise<[Incident[], number]> {
    const qb = this.repo.createQueryBuilder('incident');

    if (query.status) {
      qb.andWhere('incident.status = :status', { status: query.status });
    }
    if (query.severity) {
      qb.andWhere('incident.severity = :severity', {
        severity: query.severity,
      });
    }
    if (query.service) {
      qb.andWhere('incident.service = :service', { service: query.service });
    }
    if (query.search) {
      qb.andWhere(
        '(incident.title ILIKE :search OR incident.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const sortColumn = SORT_WHITELIST[query.sortBy ?? ''] ?? 'incident.createdAt';
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(sortColumn, sortOrder);

    qb.skip((query.page - 1) * query.limit).take(query.limit);

    return qb.getManyAndCount();
  }

  async findByIdWithTimeline(id: string): Promise<Incident | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['timelines'],
      order: { timelines: { createdAt: 'DESC' } },
    });
  }
}
