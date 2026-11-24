import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { SyncJobType, SyncJobStatus, LeadStatus, normalizeIndianPhoneNumber } from '@sv-crm/shared';

@Injectable()
export class SynchronizationService {
  private readonly logger = new Logger(SynchronizationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getSyncStatus() {
    const activeJobs = await this.prisma.syncJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const [totalSourceEntries, totalLeads, totalForms] = await Promise.all([
      this.prisma.sourceEntry.count(),
      this.prisma.leadManagement.count(),
      this.prisma.wordPressForm.count(),
    ]);

    const latestEntry = await this.prisma.sourceEntry.findFirst({
      orderBy: { submittedAt: 'desc' },
      select: { submittedAt: true, formName: true },
    });

    return {
      totalSourceEntries,
      totalLeads,
      totalForms,
      latestSubmission: latestEntry,
      recentJobs: activeJobs,
    };
  }

  async getSyncHistory() {
    return this.prisma.syncJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { site: { select: { identifier: true, siteUrl: true } } },
    });
  }

  async createImportJob(siteIdentifier?: string) {
    const siteId = siteIdentifier || this.configService.get<string>('wpSiteIdentifier', 'sv-stock-research-main');
    let site = await this.prisma.wordPressSite.findUnique({
      where: { identifier: siteId },
    });

    if (!site) {
      site = await this.prisma.wordPressSite.create({
        data: {
          identifier: siteId,
          siteUrl: this.configService.get<string>('wpSiteUrl', 'https://svstockresearch.in'),
          webhookSecret: this.configService.get<string>('wpWebhookSecret', 'pending_secret'),
          pullSecret: this.configService.get<string>('wpPullSecret', 'pending_pull_secret'),
        },
      });
    }

    const job = await this.prisma.syncJob.create({
      data: {
        siteId: site.id,
        jobType: SyncJobType.HISTORICAL_IMPORT,
        status: SyncJobStatus.PENDING,
      },
    });

    return job;
  }
}
