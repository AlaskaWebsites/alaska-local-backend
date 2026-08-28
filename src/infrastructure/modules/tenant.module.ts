import { Module } from '@nestjs/common'
import { TOKENS } from '@core/application/tokens'
import { GetTenantBySlugUseCase } from '@core/application/use-cases/get-tenant-by-slug.use-case'
import { ResolveTenantByDomainUseCase } from '@core/application/use-cases/resolve-tenant-by-domain.use-case'
import { InMemoryTenantRepository } from '../persistence/in-memory/in-memory-tenant.repository'
import { TenantController } from '../http/controllers/tenant.controller'
import { ITenantRepository } from '@core/application/ports/tenant.repository.port'

@Module({
  controllers: [TenantController],
  providers: [
    {
      provide: TOKENS.TENANT_REPOSITORY,
      useClass: InMemoryTenantRepository
    },
    {
      provide: GetTenantBySlugUseCase,
      useFactory: (repo: ITenantRepository) => new GetTenantBySlugUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    },
    {
      provide: ResolveTenantByDomainUseCase,
      useFactory: (repo: ITenantRepository) => new ResolveTenantByDomainUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    }
  ],
  exports: [TOKENS.TENANT_REPOSITORY, GetTenantBySlugUseCase, ResolveTenantByDomainUseCase]
})
export class TenantModule {}
