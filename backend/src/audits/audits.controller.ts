import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { AuditsService } from './audits.service';
import { CreateAuditDto, CloseAuditDto } from './dto/audit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('audits')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditsController {
  constructor(private auditsService: AuditsService) {}

  @Get('stats')
  @RequirePermissions('audits:read')
  getStats() {
    return this.auditsService.getStats();
  }

  @Get()
  @RequirePermissions('audits:read')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('auditorId') auditorId?: string,
  ) {
    return this.auditsService.findAll({ page: +page, limit: +limit, status, auditorId: +auditorId });
  }

  @Get(':id')
  @RequirePermissions('audits:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditsService.findOne(id);
  }

  @Post()
  @RequirePermissions('audits:write')
  create(@Body() dto: CreateAuditDto) {
    return this.auditsService.create(dto);
  }

  @Put(':id')
  @RequirePermissions('audits:write')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateAuditDto>,
  ) {
    return this.auditsService.update(id, dto);
  }

  @Patch(':id/close')
  @RequirePermissions('audits:close')
  close(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CloseAuditDto,
  ) {
    return this.auditsService.close(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('audits:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.auditsService.remove(id);
  }
}
