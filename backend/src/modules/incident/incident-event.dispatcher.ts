import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { IncidentEventProcessor } from './incident-event.processor';
import { PayloadFor } from './events/event-payloads';
import { QueueEvent, INCIDENT_QUEUE } from '../../common/enums/index';

@Injectable()
export class IncidentEventDispatcher {
  private readonly logger = new Logger(IncidentEventDispatcher.name);

  constructor(
    @InjectQueue(INCIDENT_QUEUE)
    private readonly queue: Queue,
    private readonly processor: IncidentEventProcessor,
  ) {}

  async dispatch<E extends QueueEvent>(
    event: E,
    data: PayloadFor<E>,
  ): Promise<void> {
    try {
      await this.queue.add(event, data);
    } catch (error) {
      this.logger.warn(
        `Queue unavailable for ${event}, processing synchronously: ${
          error instanceof Error ? error.message : 'unknown'
        }`,
      );
      await this.processor.process(event, data);
    }
  }
}
