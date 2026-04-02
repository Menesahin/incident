import { DataSource } from 'typeorm';
import { Incident } from '../modules/incident/entities/incident.entity.js';
import { IncidentTimeline } from '../modules/incident/entities/incident-timeline.entity.js';
import { Severity } from '../common/enums/severity.enum.js';
import { Status } from '../common/enums/status.enum.js';
import { ServiceName } from '../common/enums/service-name.enum.js';
import { TimelineAction } from '../common/enums/timeline-action.enum.js';
import { Logger } from '@nestjs/common';

const logger = new Logger('Seed');

const SEED_INCIDENTS: Array<{
  title: string;
  description: string | null;
  service: ServiceName;
  severity: Severity;
  status: Status;
}> = [
  {
    title: 'Payment gateway timeout',
    description: 'Stripe API returning 504 errors for 10% of requests. Checkout flow impacted.',
    service: ServiceName.PAYMENT_API,
    severity: Severity.CRITICAL,
    status: Status.INVESTIGATING,
  },
  {
    title: 'OAuth token refresh failure',
    description: 'Users unable to re-authenticate after token expiry. Refresh endpoint returning 500.',
    service: ServiceName.AUTH_SERVICE,
    severity: Severity.HIGH,
    status: Status.OPEN,
  },
  {
    title: 'Email delivery delays',
    description: 'Transactional emails delayed by 15-30 minutes. SMTP provider experiencing issues.',
    service: ServiceName.NOTIFICATION_WORKER,
    severity: Severity.MEDIUM,
    status: Status.OPEN,
  },
  {
    title: 'Subscription billing double charge',
    description: 'Some users charged twice for monthly subscription. Idempotency key issue suspected.',
    service: ServiceName.PAYMENT_API,
    severity: Severity.CRITICAL,
    status: Status.RESOLVED,
  },
  {
    title: 'Login rate limiting too aggressive',
    description: 'Legitimate users locked out after 3 attempts. Rate limit threshold misconfigured.',
    service: ServiceName.AUTH_SERVICE,
    severity: Severity.HIGH,
    status: Status.OPEN,
  },
  {
    title: 'Push notification delivery failure',
    description: 'Firebase Cloud Messaging returning 401. API key may have been rotated.',
    service: ServiceName.NOTIFICATION_WORKER,
    severity: Severity.HIGH,
    status: Status.INVESTIGATING,
  },
  {
    title: 'Payment webhook retry storm',
    description: 'Stripe webhooks failing validation, triggering exponential retries. Queue backing up.',
    service: ServiceName.PAYMENT_API,
    severity: Severity.HIGH,
    status: Status.INVESTIGATING,
  },
  {
    title: 'Session fixation vulnerability',
    description: 'Session ID not regenerated after login. Security audit finding — needs immediate fix.',
    service: ServiceName.AUTH_SERVICE,
    severity: Severity.CRITICAL,
    status: Status.OPEN,
  },
  {
    title: 'SMS OTP not delivered to certain carriers',
    description: 'Twilio reporting delivery failures for T-Mobile numbers. Affecting 2FA flow.',
    service: ServiceName.NOTIFICATION_WORKER,
    severity: Severity.MEDIUM,
    status: Status.RESOLVED,
  },
  {
    title: 'Refund processing stuck in queue',
    description: 'Refund jobs not being processed. Worker crashed and did not restart.',
    service: ServiceName.PAYMENT_API,
    severity: Severity.HIGH,
    status: Status.RESOLVED,
  },
  {
    title: 'CORS misconfiguration on auth endpoints',
    description: 'Mobile app unable to call /api/auth/* endpoints. Missing Access-Control-Allow-Origin header.',
    service: ServiceName.AUTH_SERVICE,
    severity: Severity.MEDIUM,
    status: Status.RESOLVED,
  },
  {
    title: 'Notification preference sync lag',
    description: 'User preference changes taking 10+ minutes to propagate. Cache invalidation issue.',
    service: ServiceName.NOTIFICATION_WORKER,
    severity: Severity.LOW,
    status: Status.OPEN,
  },
  {
    title: 'Currency conversion rounding errors',
    description: 'Multi-currency payments showing 1-2 cent discrepancies. Floating point math issue.',
    service: ServiceName.PAYMENT_API,
    severity: Severity.MEDIUM,
    status: Status.INVESTIGATING,
  },
  {
    title: 'JWT clock skew rejection',
    description: 'Tokens issued by server A rejected by server B due to 3s clock difference.',
    service: ServiceName.AUTH_SERVICE,
    severity: Severity.LOW,
    status: Status.RESOLVED,
  },
  {
    title: 'Email template rendering broken',
    description: 'HTML emails showing raw Handlebars syntax. Template engine upgrade broke partials.',
    service: ServiceName.NOTIFICATION_WORKER,
    severity: Severity.MEDIUM,
    status: Status.INVESTIGATING,
  },
  {
    title: 'PCI compliance scan failure',
    description: 'Quarterly PCI DSS scan found TLS 1.0 still enabled on payment endpoints.',
    service: ServiceName.PAYMENT_API,
    severity: Severity.CRITICAL,
    status: Status.OPEN,
  },
  {
    title: 'Password reset link expiry too short',
    description: 'Users reporting expired links. Current TTL is 5 minutes — should be 30.',
    service: ServiceName.AUTH_SERVICE,
    severity: Severity.LOW,
    status: Status.OPEN,
  },
  {
    title: 'Webhook notification payload mismatch',
    description: 'Partner webhook payloads missing order_id field after API v2 migration.',
    service: ServiceName.NOTIFICATION_WORKER,
    severity: Severity.HIGH,
    status: Status.OPEN,
  },
];

async function seed() {
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    logger.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [Incident, IncidentTimeline],
    synchronize: true,
  });

  await dataSource.initialize();
  logger.log('Database connected');

  const incidentRepo = dataSource.getRepository(Incident);
  const timelineRepo = dataSource.getRepository(IncidentTimeline);

  const count = await incidentRepo.count();
  if (count > 0) {
    logger.log(`Database already has ${count} incidents — skipping seed`);
    await dataSource.destroy();
    return;
  }

  for (const data of SEED_INCIDENTS) {
    const incident = await incidentRepo.save(data);

    await timelineRepo.save({
      incidentId: incident.id,
      action: TimelineAction.CREATED,
    });

    if (incident.status !== Status.OPEN) {
      await timelineRepo.save({
        incidentId: incident.id,
        action: TimelineAction.STATUS_CHANGED,
        field: 'status',
        previousValue: Status.OPEN,
        newValue: incident.status,
      });
    }
  }

  logger.log(`Seeded ${SEED_INCIDENTS.length} incidents with timeline entries`);
  await dataSource.destroy();
  logger.log('Database connection closed');
}

seed().catch((error) => {
  logger.error('Seed failed', error instanceof Error ? error.stack : undefined);
  process.exit(1);
});
