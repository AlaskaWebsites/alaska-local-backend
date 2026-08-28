import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common'
import { GetTenantBySlugUseCase } from '@core/application/use-cases/get-tenant-by-slug.use-case'
import { ResolveTenantByDomainUseCase } from '@core/application/use-cases/resolve-tenant-by-domain.use-case'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'

const ResolveDomainQuerySchema = z.object({
  host: z.string().min(1, 'Host é obrigatório')
})

type ResolveDomainQuery = z.infer<typeof ResolveDomainQuerySchema>

@Controller('tenants')
export class TenantController {
  constructor(
    private readonly getTenantBySlugUseCase: GetTenantBySlugUseCase,
    private readonly resolveTenantByDomainUseCase: ResolveTenantByDomainUseCase
  ) {}

  @Get('resolve')
  @UsePipes(new ZodValidationPipe(ResolveDomainQuerySchema))
  async resolveByDomain(@Query() query: ResolveDomainQuery) {
    const tenant = await this.resolveTenantByDomainUseCase.execute({ host: query.host })
    return {
      success: true,
      data: tenant.toJSON(),
      meta: { isOpen: tenant.isOpen() }
    }
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const tenant = await this.getTenantBySlugUseCase.execute({ slug })
    return {
      success: true,
      data: tenant.toJSON(),
      meta: { isOpen: tenant.isOpen() }
    }
  }
}
