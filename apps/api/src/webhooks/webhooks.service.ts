import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { normalizeIndianPhoneNumber, LeadStatus, ActivityAction } from '@sv-crm/shared';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  verifySignature(
    rawBody: string,
    signature: string,
    timestamp: string,
    secret: string,
  ): boolean {
    if (!signature || !timestamp || !secret) {
      return false;
    }

    // Tolerance check (5 minutes = 300 seconds)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const reqTimestamp = parseInt(timestamp, 10);
    if (Math.abs(currentTimestamp - reqTimestamp) > 300) {
      this.logger.warn(`Webhook rejected: timestamp expired. req=${reqTimestamp}, current=${currentTimestamp}`);
      return false;
    }

    const payloadToSign = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadToSign)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex'),
      );
    } catch {
      return false;
    }
  }

  normalizeWPFormsFields(fields: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};

    for (const key of Object.keys(fields || {})) {
      const field = fields[key];
      const label = (field.name || field.label || '').toLowerCase();
      const val = field.value !== undefined ? field.value : '';

      if (label.includes('name')) {
        normalized.fullName = typeof val === 'object' ? `${val.first || ''} ${val.last || ''}`.trim() : String(val);
      } else if (label.includes('phone') || label.includes('mobile') || label.includes('contact')) {
        normalized.phone = normalizeIndianPhoneNumber(String(val));
      } else if (label.includes('email')) {
        normalized.email = String(val).trim().toLowerCase();
      } else if (label.includes('state')) {
        normalized.state = String(val).trim();
      } else if (label.includes('segment') || label.includes('trading segment')) {
        normalized.tradingSegment = String(val).trim();
      } else if (label.includes('capital') || label.includes('investment')) {
        normalized.tradingCapital = String(val).trim();
      } else if (label.includes('message') || label.includes('comment')) {
        normalized.message = String(val).trim();
      }
    }

    return normalized;
  }

  async processIncomingWPFormsSubmission(
    payload: any,
    headers: {
      timestamp?: string;
      siteIdentifier?: string;
      signature?: string;
      requestId?: string;
    },
    rawBody: string,
  ) {
    const configuredSecret = this.configService.get<string>('wpWebhookSecret');
    const configuredSiteId = this.configService.get<string>('wpSiteIdentifier', 'sv-stock-research-main');

    // In production, signature verification is strictly enforced
    if (configuredSecret) {
      const isValid = this.verifySignature(
        rawBody,
        headers.signature || '',
        headers.timestamp || '',
        configuredSecret,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid or expired HMAC webhook signature');
      }
    }

    const {
      siteIdentifier = configuredSiteId,
      formId,
      formName,
      entryId,
      submittedAt,
      fields = {},
      eventId = headers.requestId || `evt_${Date.now()}_${entryId}`,
    } = payload;

    if (!formId || !entryId) {
      throw new BadRequestException('formId and entryId are required');
    }

    // 1. Ensure site exists
    let site = await this.prisma.wordPressSite.findUnique({
      where: { identifier: siteIdentifier },
    });
    if (!site) {
      site = await this.prisma.wordPressSite.create({
        data: {
          identifier: siteIdentifier,
          siteUrl: this.configService.get<string>('wpSiteUrl', 'https://svstockresearch.in'),
          webhookSecret: configuredSecret || 'pending_secret',
          pullSecret: this.configService.get<string>('wpPullSecret', 'pending_pull_secret'),
        },
      });
    }

    // 2. Idempotency check via SyncEvent
    const existingEvent = await this.prisma.syncEvent.findUnique({
      where: {
        siteId_eventId: {
          siteId: site.id,
          eventId: String(eventId),
        },
      },
    });

    if (existingEvent && existingEvent.status === 'PROCESSED') {
      this.logger.log(`Idempotent skip: Event ${eventId} was already processed.`);
      return { skipped: true, reason: 'Already processed', eventId };
    }

    // 3. Upsert WordPressForm record
    await this.prisma.wordPressForm.upsert({
      where: {
        siteId_wpFormId: {
          siteId: site.id,
          wpFormId: String(formId),
        },
      },
      create: {
        siteId: site.id,
        wpFormId: String(formId),
        formName: formName || `Form #${formId}`,
        lastSyncedAt: new Date(),
      },
      update: {
        formName: formName || undefined,
        lastSyncedAt: new Date(),
      },
    });

    const normalizedFields = this.normalizeWPFormsFields(fields);
    const parsedSubmissionDate = submittedAt ? new Date(submittedAt) : new Date();

    // 4. Atomically insert SourceEntry + LeadManagement
    const result = await this.prisma.$transaction(async (tx) => {
      // Upsert SourceEntry - ensures source record is never duplicated
      const sourceEntry = await tx.sourceEntry.upsert({
        where: {
          siteId_wpFormId_wpEntryId: {
            siteId: site.id,
            wpFormId: String(formId),
            wpEntryId: String(entryId),
          },
        },
        create: {
          siteId: site.id,
          wpFormId: String(formId),
          wpEntryId: String(entryId),
          formName: formName || `Form #${formId}`,
          submittedAt: parsedSubmissionDate,
          originalFields: fields,
          normalizedFields,
        },
        update: {
          // Do not mutate original fields if already stored!
        },
      });

      // Ensure LeadManagement exists
      const lead = await tx.leadManagement.upsert({
        where: { sourceEntryId: sourceEntry.id },
        create: {
          sourceEntryId: sourceEntry.id,
          status: LeadStatus.NEW,
          isArchived: false,
        },
        update: {},
      });

      // Record activity
      await tx.leadActivity.create({
        data: {
          leadId: lead.id,
          action: ActivityAction.IMPORTED,
          description: `Captured new submission from ${formName || 'WPForms'} (#${entryId})`,
          metadata: { formId, entryId, eventId },
        },
      });

      // Record sync event
      await tx.syncEvent.upsert({
        where: {
          siteId_eventId: {
            siteId: site.id,
            eventId: String(eventId),
          },
        },
        create: {
          siteId: site.id,
          eventId: String(eventId),
          payload,
          status: 'PROCESSED',
          processedAt: new Date(),
        },
        update: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      return { sourceEntry, lead };
    });

    this.logger.log(`Successfully ingested WPForms submission: Form ${formId}, Entry ${entryId}`);
    return { success: true, leadId: result.lead.id };
  }
}
