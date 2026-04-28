import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { FormsModule } from './forms/forms.module';
import { AuditsModule } from './audits/audits.module';
import { MasterModule } from './master/master.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    FormsModule,
    AuditsModule,
    MasterModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
