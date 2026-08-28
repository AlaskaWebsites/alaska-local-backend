import { Controller, Post, Body, UsePipes } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { CalculatePixPayloadUseCase } from '@core/application/use-cases/calculate-pix-payload.use-case'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'

const GeneratePixDtoSchema = z.object({
  tenantSlug: z.string().min(1, 'Slug do tenant é obrigatório'),
  amount: z.number().min(0.01, 'Valor deve ser no mínimo R$ 0,01'),
  txid: z.string().optional(),
  isTestCent: z.boolean().optional().default(false)
})

type GeneratePixDto = z.infer<typeof GeneratePixDtoSchema>

@ApiTags('pix')
@Controller('pix')
export class PixController {
  constructor(private readonly calculatePixPayloadUseCase: CalculatePixPayloadUseCase) {}

  @Post('brcode')
  @ApiOperation({ summary: 'Gera o payload BR Code EMV oficial (Copia e Cola) com CRC-16 para pagamento Pix' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tenantSlug: { type: 'string', example: 'karine-finardi' },
        amount: { type: 'number', example: 149.90 },
        txid: { type: 'string', example: 'PEDIDO123' },
        isTestCent: { type: 'boolean', example: false, description: 'Se true, calcula payload com R$ 0,01 para teste real' }
      },
      required: ['tenantSlug', 'amount']
    }
  })
  @ApiResponse({ status: 200, description: 'Payload BR Code gerado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Tenant não encontrado' })
  @UsePipes(new ZodValidationPipe(GeneratePixDtoSchema))
  async generateBrCode(@Body() dto: GeneratePixDto) {
    const result = await this.calculatePixPayloadUseCase.execute(dto)
    return {
      success: true,
      data: result
    }
  }
}
