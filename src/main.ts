import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
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

  await app.listen(env.PORT)
  console.log(`🚀 Alaska Local Backend rodando na porta ${env.PORT} (Ambiente: ${env.NODE_ENV})`)
  console.log(`📡 Health Check: http://localhost:${env.PORT}/api/v1/health`)
}

bootstrap()
