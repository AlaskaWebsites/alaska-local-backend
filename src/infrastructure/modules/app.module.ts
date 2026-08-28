import { Module } from '@nestjs/common'
import { HealthController } from '../http/controllers/health.controller'
import { TenantModule } from './tenant.module'
import { PixModule } from './pix.module'

@Module({
  imports: [TenantModule, PixModule],
  controllers: [HealthController]
})
export class AppModule {}
