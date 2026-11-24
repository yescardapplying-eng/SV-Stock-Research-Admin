import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SynchronizationService } from './synchronization.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SynchronizationController {
  constructor(private readonly syncService: SynchronizationService) {}

  @Get('status')
  async getStatus() {
    return this.syncService.getSyncStatus();
  }

  @Get('history')
  async getHistory() {
    return this.syncService.getSyncHistory();
  }

  @Post('import/start')
  async startImport(@Body('siteIdentifier') siteIdentifier?: string) {
    return this.syncService.createImportJob(siteIdentifier);
  }
}
