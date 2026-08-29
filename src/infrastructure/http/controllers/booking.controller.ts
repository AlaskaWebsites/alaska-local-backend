import { Controller, Post, Body, Get, Param, Query, UsePipes } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { TOKENS } from '@core/application/tokens'
import { Inject } from '@nestjs/common'
import { IBookingRepository } from '@core/application/ports/booking.repository.port'
import { Booking } from '@core/domain/entities/booking.entity'

const CreateBookingDtoSchema = z.object({
  tenantId: z.string().min(1, 'ID do tenant é obrigatório'),
  customerName: z.string().min(2, 'Nome do cliente é obrigatório'),
  customerPhone: z.string().min(10, 'WhatsApp é obrigatório'),
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    priceCents: z.number().int().min(0),
    durationMinutes: z.number().int().min(5)
  })).min(1, 'Ao menos um serviço deve ser selecionado'),
  professionalId: z.string().optional(),
  professionalName: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data deve ser YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de horário deve ser HH:mm'),
  notes: z.string().optional(),
  paymentMode: z.enum(['on_service', 'pix_deposit', 'pix_full']).optional().default('on_service')
})

type CreateBookingDto = z.infer<typeof CreateBookingDtoSchema>

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    @Inject(TOKENS.BOOKING_REPOSITORY) private readonly bookingRepository: IBookingRepository
  ) {}

  @Post()
  @ApiOperation({ summary: 'Agenda um horário para serviços (Alaska Hub & Alaska Pro)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', example: 'ten-barbearia-style' },
        customerName: { type: 'string', example: 'Danilo Santos' },
        customerPhone: { type: 'string', example: '11999998888' },
        services: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'srv-corte' },
              name: { type: 'string', example: 'Corte Degradê + Barboterapia' },
              priceCents: { type: 'number', example: 7500 },
              durationMinutes: { type: 'number', example: 50 }
            }
          }
        },
        professionalId: { type: 'string', example: 'pro-1' },
        professionalName: { type: 'string', example: 'Mestre da Navalha' },
        date: { type: 'string', example: '2026-08-30' },
        time: { type: 'string', example: '15:00' },
        notes: { type: 'string', example: 'Toalha quente extra' },
        paymentMode: { type: 'string', enum: ['on_service', 'pix_deposit', 'pix_full'], example: 'on_service' }
      },
      required: ['tenantId', 'customerName', 'customerPhone', 'services', 'date', 'time']
    }
  })
  @ApiResponse({ status: 201, description: 'Agendamento registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @UsePipes(new ZodValidationPipe(CreateBookingDtoSchema))
  async create(@Body() dto: CreateBookingDto) {
    const booking = new Booking({
      id: `bk-${Date.now()}`,
      tenantId: dto.tenantId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      services: dto.services,
      professionalId: dto.professionalId,
      professionalName: dto.professionalName,
      date: dto.date,
      time: dto.time,
      notes: dto.notes,
      paymentMode: dto.paymentMode
    })

    await this.bookingRepository.save(booking)

    return {
      success: true,
      data: {
        id: booking.id,
        tenantId: booking.tenantId,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        date: booking.date,
        time: booking.time,
        totalPrice: booking.calculateTotalPrice().amount,
        totalDurationMinutes: booking.calculateTotalDurationMinutes(),
        status: booking.status
      }
    }
  }

  @Get('tenant/:tenantId')
  @ApiOperation({ summary: 'Lista agendamentos por tenant e data para controle de agenda' })
  @ApiParam({ name: 'tenantId', description: 'ID do tenant', example: 'ten-barbearia-style' })
  @ApiQuery({ name: 'date', description: 'Data no formato YYYY-MM-DD', example: '2026-08-30' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos retornada com sucesso' })
  async listByTenantAndDate(
    @Param('tenantId') tenantId: string,
    @Query('date') date: string
  ) {
    const bookings = await this.bookingRepository.listByTenantAndDate(tenantId, date || new Date().toISOString().split('T')[0])
    return {
      success: true,
      data: bookings.map(b => ({
        id: b.id,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        professionalName: b.professionalName,
        date: b.date,
        time: b.time,
        totalPrice: b.calculateTotalPrice().amount,
        totalDurationMinutes: b.calculateTotalDurationMinutes(),
        status: b.status
      }))
    }
  }
}
