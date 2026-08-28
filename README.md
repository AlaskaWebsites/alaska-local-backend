# 🏔️ Alaska Local — Backend & AI Agent Engine

> **Backend NestJS 11 com Clean Architecture (Ports & Adapters), Validação Fail-Fast com Zod, Supabase / PostgreSQL com RLS, Filas Assíncronas com BullMQ/Redis e Pipeline de Agentes Autônomos de IA.**

---

## 🏛️ Visão Geral da Arquitetura

O **Alaska Local Backend** é a espinha dorsal de serviços do ecossistema Alaska Local (Alaska Menu, Alaska Shop, Alaska Hub, Alaska Pro), projetado para atender aos estágios de expansão e operação multi-tenant:

```
src/
├── core/                                # Núcleo de Regras de Negócio (Framework-Agnostic / Zero Decorators)
│   ├── domain/                         # Entidades Puras (POTO), Value Objects e Erros de Domínio
│   │   ├── entities/                   # Tenant, Product, Order, Booking, Customer, Payment
│   │   ├── value-objects/              # Money, PixKey, Phone, OpeningHours, Address
│   │   └── events/                     # OrderCreatedEvent, BookingConfirmedEvent, PaymentReceivedEvent
│   └── application/                    # Casos de Uso (Use Cases) e Portas (Interfaces)
│       ├── use-cases/                  # CreateOrderUseCase, ScheduleBookingUseCase, SyncTenantCatalogUseCase
│       └── ports/                      # ITenantRepository, IOrderRepository, IPaymentGateway, ILLMService
│
├── infrastructure/                     # Adaptadores de Entrada/Saída e Integrações com Frameworks
│   ├── persistence/                    # Adaptadores Supabase / PostgreSQL com RLS e Drizzle/Prisma
│   ├── http/                           # Controllers NestJS 11, Zod Validation Pipes, Interceptors
│   ├── queue/                          # Workers BullMQ + Redis para Processamento Assíncrono
│   ├── gateways/                       # Gateway Asaas (Pix D+0, Webhooks) e WhatsApp API
│   └── ai/                             # Pipeline de Agentes de IA, Model Context Protocol (MCP) e LLMs
│
└── config/                             # Validação de Variáveis de Ambiente Fail-Fast com Zod
```

---

## 🤖 Engenharia de IA & Agentes Autônomos

1. **Agente de Extração & Curadoria de Cardápios/Catálogos (Vision/OCR -> Zod):**
   - Transforma fotos de cardápios impressos, feeds do Instagram e PDFs em catálogos estruturados validados contra o `TenantSchema`.
2. **Agente de Atendimento & Co-piloto WhatsApp (MCP Tools):**
   - Resolução de pedidos, cálculo dinâmico de horários e slots de agendamento em tempo real.
3. **Agente de Prospecção & Geração de Demos (Showcase Engine):**
   - Crawling ético de estabelecimentos locais no Google Maps e montagem automática de vitrines digitais.
4. **Agente de Upsell & Cross-Selling Inteligente:**
   - Sugestão contextual de adicionais e produtos complementares no checkout.

---

## 🛠️ Stack Tecnológica

- **Framework:** NestJS 11 (Strict TypeScript, Node 22+)
- **Validação:** Zod (Ambiente, DTOs, Webhooks e LLM Output Schemas)
- **Banco de Dados:** PostgreSQL 16 / Supabase com Row Level Security (RLS)
- **Filas & Mensageria:** BullMQ + Redis (AOF Persistence)
- **Testes:** Vitest (100% de cobertura nos Casos de Uso)
- **Deploy:** Docker / Render / Fly.io / Railway
