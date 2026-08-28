import { Controller, Post, Body, UsePipes } from '@nestjs/common'
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

@Controller('pix')
export class PixController {
  constructor(private readonly calculatePixPayloadUseCase: CalculatePixPayloadUseCase) {}

  @Post('brcode')
  @UsePipes(new ZodValidationPipe(GeneratePixDtoSchema))
  async generateBrCode(@Body() dto: GeneratePixDto) {
    const result = await this.calculatePixPayloadUseCase.execute(dto)
    return {
      success: true,
      data: result
    }
  }
}
