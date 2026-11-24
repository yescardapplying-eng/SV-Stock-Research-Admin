import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const forms = await this.prisma.wordPressForm.findMany({
      include: {
        site: {
          select: { identifier: true, siteUrl: true },
        },
      },
      orderBy: { formName: 'asc' },
    });

    // Count entries per form
    const counts = await this.prisma.sourceEntry.groupBy({
      by: ['wpFormId'],
      _count: { _all: true },
    });

    const countMap = new Map(counts.map((c: any) => [c.wpFormId, c._count._all]));

    return forms.map((form: any) => ({
      ...form,
      totalImportedEntries: countMap.get(form.wpFormId) || 0,
    }));
  }

  async findOne(id: string) {
    return this.prisma.wordPressForm.findUnique({
      where: { id },
      include: { site: true },
    });
  }
}
