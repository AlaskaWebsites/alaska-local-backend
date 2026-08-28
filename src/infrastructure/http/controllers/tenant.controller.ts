import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { GetTenantBySlugUseCase } from '@core/application/use-cases/get-tenant-by-slug.use-case'
import { ResolveTenantByDomainUseCase } from '@core/application/use-cases/resolve-tenant-by-domain.use-case'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'

const ResolveDomainQuerySchema = z.object({
  host: z.string().min(1, 'Host é obrigatório')
})

type ResolveDomainQuery = z.infer<typeof ResolveDomainQuerySchema>

@ApiTags('tenants')
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly getTenantBySlugUseCase: GetTenantBySlugUseCase,
    private readonly resolveTenantByDomainUseCase: ResolveTenantByDomainUseCase
  ) {}

  @Get('resolve')
  @ApiOperation({ summary: 'Resolve o estabelecimento a partir do domínio próprio ou subdomínio (Host Header)' })
  @ApiQuery({ name: 'host', description: 'Host ou domínio acessado (ex: karinefinardi.com.br ou adega-prime.alaska.app)', example: 'karinefinardi.com.br' })
  @ApiResponse({ status: 200, description: 'Estabelecimento resolvido com sucesso' })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado para o domínio informado' })
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
  @ApiOperation({ summary: 'Busca os dados operacionais, tema e catálogo de um estabelecimento por slug' })
  @ApiParam({ name: 'slug', description: 'Slug do tenant (ex: karine-finardi, adega-prime, barbearia-style)', example: 'karine-finardi' })
  @ApiResponse({ status: 200, description: 'Dados do tenant e status de atendimento calculados' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado ou inativo' })
  async getBySlug(@Param('slug') slug: string) {
    const tenant = await this.getTenantBySlugUseCase.execute({ slug })
    return {
      success: true,
      data: tenant.toJSON(),
      meta: { isOpen: tenant.isOpen() }
    }
  }
}
