import { Module } from '@nestjs/common';
import { AuditsService } from './audits.service';
import { AuditsController } from './audits.controller';

@Module({
  providers: [AuditsService],
  controllers: [AuditsController],
})
export class AuditsModule {}
