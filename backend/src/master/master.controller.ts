import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { MasterService } from './master.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@Controller('master')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MasterController {
  constructor(private masterService: MasterService) {}

  @Get('unidades-ejecutoras')
  @RequirePermissions('master:read')
  findAll() {
    return this.masterService.findAllUnidades();
  }

  @Post('unidades-ejecutoras')
  @RequirePermissions('master:write')
  create(@Body() body: { name: string; code?: string; address?: string }) {
    return this.masterService.createUnidad(body);
  }

  @Put('unidades-ejecutoras/:id')
  @RequirePermissions('master:write')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; code?: string; address?: string; isActive?: boolean },
  ) {
    return this.masterService.updateUnidad(id, body);
  }

  @Delete('unidades-ejecutoras/:id')
  @RequirePermissions('master:write')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.masterService.deleteUnidad(id);
  }
}
