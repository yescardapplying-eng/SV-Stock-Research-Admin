import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueryLeadsDto, UpdateLeadStatusDto, CreateLeadNoteDto, CreateLeadOverrideDto } from './dto/lead-requests.dto';
import { LeadStatus, ActivityAction } from '@sv-crm/shared';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryLeadsDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {
      isArchived: query.archived || false,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.wpFormId) {
      where.sourceEntry = {
        wpFormId: query.wpFormId,
      };
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { sourceEntry: { formName: { contains: term, mode: 'insensitive' } } },
        { sourceEntry: { normalizedFields: { path: ['fullName'], string_contains: term } } },
        { sourceEntry: { normalizedFields: { path: ['phone'], string_contains: term } } },
        { sourceEntry: { normalizedFields: { path: ['email'], string_contains: term } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.leadManagement.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
        },
        include: {
          sourceEntry: true,
          _count: {
            select: { notes: true, activities: true },
          },
        },
      }),
      this.prisma.leadManagement.count({ where }),
    ]);

    const formattedItems = items.map((item) => ({
      id: item.id,
      sourceEntryId: item.sourceEntryId,
      wpSiteId: item.sourceEntry.siteId,
      wpFormId: item.sourceEntry.wpFormId,
      wpEntryId: item.sourceEntry.wpEntryId,
      formName: item.sourceEntry.formName,
      submittedAt: item.sourceEntry.submittedAt.toISOString(),
      status: item.status,
      isArchived: item.isArchived,
      archivedAt: item.archivedAt?.toISOString() || null,
      nextFollowupAt: item.nextFollowupAt?.toISOString() || null,
      lastContactedAt: item.lastContactedAt?.toISOString() || null,
      normalizedFields: item.sourceEntry.normalizedFields as any,
      originalFields: item.sourceEntry.originalFields as any,
      notesCount: item._count.notes,
      activitiesCount: item._count.activities,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return {
      items: formattedItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: page * pageSize < total,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.leadManagement.findUnique({
      where: { id },
      include: {
        sourceEntry: true,
        notes: {
          include: { createdBy: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          include: { performedBy: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
        overrides: {
          include: { updatedBy: { select: { id: true, name: true } } },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto, adminId?: string) {
    const existing = await this.findOne(id);
    const oldStatus = existing.status;

    const updated = await this.prisma.leadManagement.update({
      where: { id },
      data: {
        status: dto.status,
        lastContactedAt: new Date(),
        nextFollowupAt: dto.nextFollowupAt ? new Date(dto.nextFollowupAt) : existing.nextFollowupAt,
      },
    });

    // Record activity
    await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        action: ActivityAction.STATUS_CHANGED,
        description: `Lead status changed from ${oldStatus} to ${dto.status}`,
        metadata: { oldStatus, newStatus: dto.status },
        performedByAdminId: adminId,
      },
    });

    if (dto.note) {
      await this.addNote(id, { note: dto.note }, adminId);
    }

    return updated;
  }

  async addNote(id: string, dto: CreateLeadNoteDto, adminId?: string) {
    await this.findOne(id);

    const note = await this.prisma.leadNote.create({
      data: {
        leadId: id,
        note: dto.note,
        createdByAdminId: adminId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        action: ActivityAction.NOTE_ADDED,
        description: 'New internal note added',
        performedByAdminId: adminId,
      },
    });

    return note;
  }

  async archiveLead(id: string, adminId?: string) {
    const lead = await this.findOne(id);
    if (lead.isArchived) {
      throw new BadRequestException('Lead is already archived');
    }

    const updated = await this.prisma.leadManagement.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        action: ActivityAction.ARCHIVED,
        description: 'Lead archived',
        performedByAdminId: adminId,
      },
    });

    return updated;
  }

  async restoreLead(id: string, adminId?: string) {
    const lead = await this.findOne(id);
    if (!lead.isArchived) {
      throw new BadRequestException('Lead is not archived');
    }

    const updated = await this.prisma.leadManagement.update({
      where: { id },
      data: {
        isArchived: false,
        archivedAt: null,
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        action: ActivityAction.RESTORED,
        description: 'Lead restored to active list',
        performedByAdminId: adminId,
      },
    });

    return updated;
  }

  async applyOverride(id: string, dto: CreateLeadOverrideDto, adminId?: string) {
    const lead = await this.findOne(id);
    const originalFields = lead.sourceEntry.originalFields as any;
    const originalValue = originalFields[dto.fieldKey]?.value || null;

    const override = await this.prisma.leadOverride.upsert({
      where: {
        leadId_fieldKey: {
          leadId: id,
          fieldKey: dto.fieldKey,
        },
      },
      create: {
        leadId: id,
        fieldKey: dto.fieldKey,
        originalValue: String(originalValue ?? ''),
        correctedValue: dto.correctedValue,
        updatedByAdminId: adminId,
      },
      update: {
        correctedValue: dto.correctedValue,
        updatedByAdminId: adminId,
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        action: ActivityAction.OVERRIDE_APPLIED,
        description: `CRM override applied for field: ${dto.fieldKey}`,
        metadata: { fieldKey: dto.fieldKey, correctedValue: dto.correctedValue },
        performedByAdminId: adminId,
      },
    });

    return override;
  }
}
