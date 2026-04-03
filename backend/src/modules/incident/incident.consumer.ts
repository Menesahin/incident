import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { IncidentEventProcessor } from './incident-event.processor';
import { EventPayloadMap } from './events/event-payloads';
import { INCIDENT_QUEUE, QueueEvent } from '../../common/enums/index';

const VALID_EVENTS = new Set<string>(Object.values(QueueEvent));

@Processor(INCIDENT_QUEUE, { concurrency: 1 })
export class IncidentConsumer extends WorkerHost {
  private readonly logger = new Logger(IncidentConsumer.name);

  constructor(private readonly processor: IncidentEventProcessor) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (!VALID_EVENTS.has(job.name)) {
      throw new Error(`Unknown job name: ${job.name}`);
    }

    const event = job.name as QueueEvent;
    await this.processor.process(
      event,
      job.data as EventPayloadMap[typeof event],
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.log(`Job completed: ${job.name} [${job.id}]`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error): void {
    this.logger.error(
      `Job failed: ${job?.name ?? 'unknown'} [${job?.id ?? 'unknown'}] — ${error.message}`,
      error.stack,
    );
  }
}
