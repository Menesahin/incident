import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { SocketEvent, SocketRoom } from '../../common/enums/index.js';

import { ChangeEntry } from '../../common/interfaces/change-entry.interface.js';

// Decorator params are static and evaluated at class-definition time (runtime
// in NestJS, after env is loaded). process.env is intentional here because
// ConfigService is not available in decorator context. Falls back to '*' for dev.
@WebSocketGateway({
  cors: {
    origin: process.env['CORS_ORIGIN'] || '*',
    credentials: true,
  },
  namespace: '/incidents',
})
export class IncidentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(IncidentGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly configService: ConfigService) {}

  afterInit(server: Server): void {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        const pubClient = new Redis(redisUrl);
        const subClient = pubClient.duplicate();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        server.adapter(createAdapter(pubClient, subClient) as never);
        this.logger.log('Redis adapter configured for Socket.IO');
      } catch (error) {
        this.logger.warn(
          `Failed to setup Redis adapter: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }
  }

  handleConnection(client: Socket): void {
    client.join(SocketRoom.ALL_INCIDENTS);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SocketEvent.SUBSCRIBE_INCIDENT)
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { incidentId: string },
  ): void {
    const room = SocketRoom.INCIDENT(data.incidentId);
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
  }

  @SubscribeMessage(SocketEvent.UNSUBSCRIBE_INCIDENT)
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { incidentId: string },
  ): void {
    const room = SocketRoom.INCIDENT(data.incidentId);
    client.leave(room);
    this.logger.log(`Client ${client.id} left room ${room}`);
  }

  public emitCreated(incident: Record<string, unknown>): void {
    this.server
      .to(SocketRoom.ALL_INCIDENTS)
      .emit(SocketEvent.INCIDENT_CREATED, { incident });
  }

  public emitUpdated(
    incident: Record<string, unknown>,
    changes: ChangeEntry[],
  ): void {
    const payload = { incident, changes };
    this.server.to(SocketRoom.ALL_INCIDENTS).emit(SocketEvent.INCIDENT_UPDATED, payload);

    const id = incident['id'] as string;
    if (id) {
      this.server
        .to(SocketRoom.INCIDENT(id))
        .emit(SocketEvent.INCIDENT_UPDATED, payload);
    }
  }

  public emitDeleted(id: string): void {
    this.server
      .to(SocketRoom.ALL_INCIDENTS)
      .emit(SocketEvent.INCIDENT_DELETED, { id });
  }
}
