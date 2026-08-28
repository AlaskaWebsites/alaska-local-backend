import { describe, it, expect, beforeEach } from 'vitest'
import { CalculatePixPayloadUseCase } from '@core/application/use-cases/calculate-pix-payload.use-case'
import { InMemoryTenantRepository } from '@infra/persistence/in-memory/in-memory-tenant.repository'
import { LocalPixGateway } from '@infra/gateways/local-pix.gateway'
import { Tenant } from '@core/domain/entities/tenant.entity'

describe('Unit: CalculatePixPayloadUseCase', () => {
  let tenantRepo: InMemoryTenantRepository
  let pixGateway: LocalPixGateway
  let useCase: CalculatePixPayloadUseCase

  beforeEach(() => {
    tenantRepo = new InMemoryTenantRepository()
    pixGateway = new LocalPixGateway()
    useCase = new CalculatePixPayloadUseCase(tenantRepo, pixGateway)
  })

  it('deve gerar payload BR Code para valor normal', async () => {
    await tenantRepo.save(new Tenant({
      id: '1',
      slug: 'karine-finardi',
      name: 'Karine Finardi Semijoias',
      phoneWhatsApp: '11999998888',
      businessCategory: 'shop',
      pixConfig: {
        key: '11999998888',
        keyType: 'phone',
        beneficiary: 'Karine Finardi',
        city: 'FRANCISCO MORATO'
      }
    }))

    const result = await useCase.execute({
      tenantSlug: 'karine-finardi',
      amount: 150.00,
      txid: 'PEDIDO1'
    })

    expect(result.pixKey).toBe('11999998888')
    expect(result.amount).toBe(150.00)
    expect(result.copiaECola).toContain('000201')
    expect(result.copiaECola).toContain('br.gov.bcb.pix')
  })

  it('deve gerar payload de R$ 0,01 quando isTestCent for true', async () => {
    await tenantRepo.save(new Tenant({
      id: '2',
      slug: 'adega-prime',
      name: 'Adega Prime',
      phoneWhatsApp: '11977776666',
      businessCategory: 'menu'
    }))

    const result = await useCase.execute({
      tenantSlug: 'adega-prime',
      amount: 80.00,
      isTestCent: true
    })

    expect(result.amount).toBe(0.01)
    expect(result.isTestMode).toBe(true)
    expect(result.copiaECola).toContain('54040.01')
  })
})
