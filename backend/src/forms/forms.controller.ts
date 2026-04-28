import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto, UpdateFormDto } from './dto/form.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('forms')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FormsController {
  constructor(private formsService: FormsService) {}

  @Get()
  @RequirePermissions('forms:read')
  findAll() {
    return this.formsService.findAll();
  }

  @Get(':id')
  @RequirePermissions('forms:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.findOne(id);
  }

  @Post()
  @RequirePermissions('forms:write')
  create(@Body() dto: CreateFormDto, @CurrentUser() user: any) {
    return this.formsService.create(dto, user?.id);
  }

  @Put(':id')
  @RequirePermissions('forms:write')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFormDto,
  ) {
    return this.formsService.update(id, dto);
  }

  @Patch(':id/publish')
  @RequirePermissions('forms:write')
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.publish(id);
  }

  @Delete(':id')
  @RequirePermissions('forms:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.remove(id);
  }
}
