import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './infrastructure/modules/app.module'
import { DomainExceptionFilter } from './infrastructure/http/filters/domain-exception.filter'
import { validateEnv } from './config/env.schema'

async function bootstrap() {
  const env = validateEnv()
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api/v1')
  app.enableCors({
    origin: env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(','),
    credentials: true
  })
  app.useGlobalFilters(new DomainExceptionFilter())

  // Configuração do Swagger / OpenAPI na rota /docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('🏔️ Alaska Local — API & AI Agent Engine')
    .setDescription(
      'Documentação interativa dos endpoints do Alaska Local (Alaska Menu, Alaska Shop, Alaska Hub, Alaska Pro). ' +
      'Desenvolvido com NestJS 11, Clean Architecture (Ports & Adapters), validação Zod e pagamentos Pix D+0.'
    )
    .setVersion('1.0.0')
    .addTag('health', 'Verificação de integridade e uptime do serviço')
    .addTag('tenants', 'Resolução de estabelecimentos, domínios próprios e horários')
    .addTag('pix', 'Geração de BR Code EMV oficial, Copia e Cola e testes de R$ 0,01')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Alaska Local API Docs',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin-bottom: 24px }
      .swagger-ui .info .title { font-size: 28px; font-weight: 800; color: #0f172a }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 12px 0; margin-bottom: 20px }
    `
  })

  await app.listen(env.PORT)
  console.log(`🚀 Alaska Local Backend rodando na porta ${env.PORT} (Ambiente: ${env.NODE_ENV})`)
  console.log(`📑 Swagger UI Interativo: http://localhost:${env.PORT}/docs`)
  console.log(`📡 Health Check: http://localhost:${env.PORT}/api/v1/health`)
}

bootstrap()
