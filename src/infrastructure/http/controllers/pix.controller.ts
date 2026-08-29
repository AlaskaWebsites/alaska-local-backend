import { Controller, Post, Get, Body, Query, UsePipes } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger'
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

const QueryPixQrCodeSchema = z.object({
  tenantSlug: z.string().min(1, 'Slug do tenant é obrigatório'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser no mínimo R$ 0,01'),
  txid: z.string().optional(),
  isTestCent: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional())
})

type QueryPixQrCodeDto = z.infer<typeof QueryPixQrCodeSchema>

@ApiTags('pix')
@Controller('pix')
export class PixController {
  constructor(private readonly calculatePixPayloadUseCase: CalculatePixPayloadUseCase) {}

  @Post('brcode')
  @ApiOperation({ summary: 'Gera o payload BR Code EMV oficial (Copia e Cola) com CRC-16 e imagem QR Code em Base64' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tenantSlug: { type: 'string', example: 'adega-prime' },
        amount: { type: 'number', example: 149.90 },
        txid: { type: 'string', example: 'PEDIDO123' },
        isTestCent: { type: 'boolean', example: false, description: 'Se true, calcula payload com R$ 0,01 para teste real' }
      },
      required: ['tenantSlug', 'amount']
    }
  })
  @ApiResponse({ status: 200, description: 'Payload BR Code e imagem QR Code gerados com sucesso' })
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

  @Get('qrcode')
  @ApiOperation({ summary: 'Consulta os dados e imagem do QR Code Pix via parâmetros de URL (GET)' })
  @ApiQuery({ name: 'tenantSlug', description: 'Slug do estabelecimento', example: 'karine-finardi' })
  @ApiQuery({ name: 'amount', description: 'Valor em reais', example: 89.90 })
  @ApiQuery({ name: 'txid', description: 'Identificador único da transação', required: false, example: 'PED998' })
  @ApiQuery({ name: 'isTestCent', description: 'Modo teste R$ 0,01', required: false, example: false })
  @ApiResponse({ status: 200, description: 'QR Code retornado com sucesso' })
  @UsePipes(new ZodValidationPipe(QueryPixQrCodeSchema))
  async getQrCode(@Query() query: QueryPixQrCodeDto) {
    const result = await this.calculatePixPayloadUseCase.execute({
      tenantSlug: query.tenantSlug,
      amount: query.amount,
      txid: query.txid,
      isTestCent: query.isTestCent
    })
    return {
      success: true,
      data: result
    }
  }
}
