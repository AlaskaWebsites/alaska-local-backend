import { ITenantRepository } from '../ports/tenant.repository.port'
import { IPixGateway } from '../ports/pix-gateway.port'
import { EntityNotFoundError, ValidationError } from '../../domain/errors/domain.error'

export interface CalculatePixPayloadInput {
  tenantSlug: string
  amount: number
  txid?: string
  isTestCent?: boolean
}

export interface CalculatePixPayloadOutput {
  pixKey: string
  keyType: string
  beneficiary: string
  amount: number
  copiaECola: string
  isTestMode: boolean
}

export class CalculatePixPayloadUseCase {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly pixGateway: IPixGateway
  ) {}

  async execute(input: CalculatePixPayloadInput): Promise<CalculatePixPayloadOutput> {
    const tenant = await this.tenantRepository.findBySlug(input.tenantSlug)
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.tenantSlug)
    }

    const pixConfig = tenant.pixConfig
    const effectiveKey = pixConfig?.key || tenant.phoneWhatsApp.replace(/\D/g, '')
    const beneficiary = pixConfig?.beneficiary || tenant.name
    const city = pixConfig?.city || 'SAO PAULO'

    const effectiveAmount = input.isTestCent ? 0.01 : input.amount
    if (effectiveAmount <= 0) {
      throw new ValidationError('O valor do Pix deve ser maior que zero.')
    }

    const copiaECola = this.pixGateway.generateBrCode({
      key: effectiveKey,
      beneficiary,
      city,
      amount: effectiveAmount,
      txid: input.txid || 'ALASKA'
    })

    return {
      pixKey: effectiveKey,
      keyType: pixConfig?.keyType || 'phone',
      beneficiary,
      amount: effectiveAmount,
      copiaECola,
      isTestMode: !!input.isTestCent
    }
  }
}
