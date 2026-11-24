import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FormsService } from './forms.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('forms')
@UseGuards(JwtAuthGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  async getForms() {
    return this.formsService.findAll();
  }

  @Get(':id')
  async getForm(@Param('id') id: string) {
    return this.formsService.findOne(id);
  }
}
