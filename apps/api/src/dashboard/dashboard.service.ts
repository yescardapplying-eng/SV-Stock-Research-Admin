import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { LeadStatus } from '@sv-crm/shared';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalLeads,
      newLeads,
      contactedLeads,
      interestedLeads,
      followUpLeads,
      convertedLeads,
      archivedLeads,
    ] = await Promise.all([
      this.prisma.leadManagement.count({ where: { isArchived: false } }),
      this.prisma.leadManagement.count({ where: { status: LeadStatus.NEW, isArchived: false } }),
      this.prisma.leadManagement.count({ where: { status: LeadStatus.CONTACTED, isArchived: false } }),
      this.prisma.leadManagement.count({ where: { status: LeadStatus.INTERESTED, isArchived: false } }),
      this.prisma.leadManagement.count({ where: { status: LeadStatus.FOLLOW_UP, isArchived: false } }),
      this.prisma.leadManagement.count({ where: { status: LeadStatus.CONVERTED, isArchived: false } }),
      this.prisma.leadManagement.count({ where: { isArchived: true } }),
    ]);

    // Status distribution
    const statusCounts = await this.prisma.leadManagement.groupBy({
      by: ['status'],
      where: { isArchived: false },
      _count: { _all: true },
    });

    // Form distribution
    const formCounts = await this.prisma.sourceEntry.groupBy({
      by: ['formName'],
      _count: { _all: true },
    });

    return {
      metrics: {
        totalLeads,
        newLeads,
        contactedLeads,
        interestedLeads,
        followUpLeads,
        convertedLeads,
        archivedLeads,
      },
      statusDistribution: statusCounts.map((s) => ({
        status: s.status,
        count: s._count._all,
      })),
      formDistribution: formCounts.map((f) => ({
        formName: f.formName,
        count: f._count._all,
      })),
    };
  }

  async getSubmissionTrends(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const submissions = await this.prisma.sourceEntry.findMany({
      where: {
        submittedAt: { gte: startDate },
      },
      select: {
        submittedAt: true,
      },
      orderBy: { submittedAt: 'asc' },
    });

    const dateMap = new Map<string, number>();
    for (const sub of submissions) {
      const dateKey = sub.submittedAt.toISOString().split('T')[0];
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    }

    const trends = Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return trends;
  }
}
