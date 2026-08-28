import { ITenantRepository } from '@core/application/ports/tenant.repository.port'
import { Tenant } from '@core/domain/entities/tenant.entity'

export class InMemoryTenantRepository implements ITenantRepository {
  private items: Map<string, Tenant> = new Map()

  async findById(id: string): Promise<Tenant | null> {
    return this.items.get(id) || null
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    for (const tenant of this.items.values()) {
      if (tenant.slug.toLowerCase() === slug.toLowerCase()) {
        return tenant
      }
    }
    return null
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    for (const tenant of this.items.values()) {
      if (tenant.customDomain && tenant.customDomain.toLowerCase() === domain.toLowerCase()) {
        return tenant
      }
    }
    return null
  }

  async save(tenant: Tenant): Promise<void> {
    this.items.set(tenant.id, tenant)
  }

  async listAllActive(): Promise<Tenant[]> {
    return Array.from(this.items.values()).filter(t => t.isActive)
  }

  clear(): void {
    this.items.clear()
  }
}
