# Arquitetura Técnica Detalhada — Alaska Local Backend

## 1. Princípios Inegociáveis da Clean Architecture

- **Core Isolado:** A pasta `src/core/` não importa nenhum módulo do NestJS (`@nestjs/common`, `@Injectable()`, `@Controller()`).
- **Inversão de Controle:** As dependências são injetadas através de Symbols (`TENANT_REPOSITORY`, `PAYMENT_GATEWAY`) utilizando Custom Providers (`useFactory`) nos módulos do NestJS.
- **Fail-Fast com Zod:** Nenhuma requisição entra no caso de uso sem validação estrita de schema Zod.

## 2. Multi-Tenancy & Segurança (PostgreSQL RLS)

- Toda tabela de dados operacionais (`orders`, `products`, `bookings`, `customers`) contém a coluna `tenant_id`.
- Políticas de Row Level Security (RLS) garantem que um tenant nunca acesse dados de outro, mesmo em queries diretas.

## 3. Matriz de Integrações

| Serviço | Função | Protocolo / Transporte |
| :--- | :--- | :--- |
| **Supabase / Postgres** | Armazenamento relacional e RLS | TCP / Pooler PgBouncer |
| **Asaas API** | Cobrança Pix D+0 e Régua de Mensalidades | REST HTTPS + Webhooks Zod |
| **BullMQ / Redis** | Filas de processamento assíncrono e retry | IORedis / In-Memory Queue |
| **LLM Gateway (Gemini / Anthropic)** | Agentes de extração e atendimento | MCP / Structured Outputs Zod |
| **WhatsApp Cloud API / Webhook** | Notificações e co-piloto de vendas | HTTPS Webhooks |
