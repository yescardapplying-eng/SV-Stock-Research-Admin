import { Controller, Post, Body, Headers, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('wordpress/entries')
  @HttpCode(HttpStatus.OK)
  async handleWPFormsEntry(
    @Body() payload: any,
    @Headers('x-sv-crm-timestamp') timestamp: string,
    @Headers('x-sv-crm-site') siteIdentifier: string,
    @Headers('x-sv-crm-signature') signature: string,
    @Headers('x-sv-crm-request-id') requestId: string,
    @Req() req: Request,
  ) {
    const rawBody = (req as any).rawBody || JSON.stringify(payload);
    return this.webhooksService.processIncomingWPFormsSubmission(
      payload,
      { timestamp, siteIdentifier, signature, requestId },
      rawBody,
    );
  }

  @Post('wordpress/entries/batch')
  @HttpCode(HttpStatus.OK)
  async handleWPFormsEntryBatch(
    @Body() payload: { siteIdentifier?: string; entries: any[] },
    @Headers('x-sv-crm-timestamp') timestamp: string,
    @Headers('x-sv-crm-site') siteIdentifier: string,
    @Headers('x-sv-crm-signature') signature: string,
    @Headers('x-sv-crm-request-id') requestId: string,
    @Req() req: Request,
  ) {
    const rawBody = (req as any).rawBody || JSON.stringify(payload);
    return this.webhooksService.processIncomingWPFormsBatch(
      payload,
      { timestamp, siteIdentifier, signature, requestId },
      rawBody,
    );
  }
}
