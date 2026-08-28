import { Module } from '@nestjs/common'
import { HealthController } from '../http/controllers/health.controller'
import { TenantModule } from './tenant.module'

@Module({
  imports: [TenantModule],
  controllers: [HealthController]
})
export class AppModule {}
