import { Controller, Get, Patch, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { QueryLeadsDto, UpdateLeadStatusDto, CreateLeadNoteDto, CreateLeadOverrideDto } from './dto/lead-requests.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async getLeads(@Query() query: QueryLeadsDto) {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  async getLead(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeadStatusDto,
    @Req() req: any,
  ) {
    return this.leadsService.updateStatus(id, dto, req.user?.id);
  }

  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Body() dto: CreateLeadNoteDto,
    @Req() req: any,
  ) {
    return this.leadsService.addNote(id, dto, req.user?.id);
  }

  @Post(':id/archive')
  async archiveLead(@Param('id') id: string, @Req() req: any) {
    return this.leadsService.archiveLead(id, req.user?.id);
  }

  @Post(':id/restore')
  async restoreLead(@Param('id') id: string, @Req() req: any) {
    return this.leadsService.restoreLead(id, req.user?.id);
  }

  @Post(':id/overrides')
  async applyOverride(
    @Param('id') id: string,
    @Body() dto: CreateLeadOverrideDto,
    @Req() req: any,
  ) {
    return this.leadsService.applyOverride(id, dto, req.user?.id);
  }
}
