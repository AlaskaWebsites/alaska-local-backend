# ADR 007: Monorepo Unificado (Turborepo + Workspaces) e Compartilhamento de Contratos com @alaska/contracts

## Status
Aceito (Accepted)

## Data
2026-08-29

## Contexto

O ecossistema Alaska Local é composto por uma aplicação de backend em **NestJS 11 (Clean Architecture, Supabase/PostgreSQL RLS, BullMQ)** e uma aplicação frontend em **Nuxt 3 (One Codebase, Infinite Domains)**.

Atualmente, o backend implementa entidades de domínio ricas (`Tenant`, `Product`, `Order`, `Booking`), Value Objects (`Money`, `Address`, `PixKey`) e DTOs validados via `ZodValidationPipe`. No entanto, os mesmos schemas de validação Zod e tipos TypeScript estão declarados de forma duplicada no repositório frontend (`types/tenant.ts`, `types/cart.ts`, `types/booking.ts`).

### Dores Identificadas
1. **Duplicação de Esforço e Risco de Divergência**: Toda evolução de modelo (ex: novos atributos no catálogo, novas opções no checkout ou novos temas cromáticos) exige replicação manual de código em dois repositórios.
2. **Desacoplamento Frágil**: Embora o backend siga Clean Architecture com isolamento total do Core, a camada HTTP depende de DTOs que deveriam ser compartilhados como contratos estritos de entrada/saída com o frontend.
3. **Complexidade com Repositórios Distintos**: Publicar pacotes NPM privados ou usar submodules do Git adiciona atrito desnecessário ao fluxo de trabalho ágil e ao desenvolvimento com IA/Cursor IDE.

---

## Decisão

Adotamos a arquitetura de **Monorepo Unificado baseado em Workspaces e Turborepo**, onde o backend residirá em `apps/api` e consumirá os contratos de domínio e validação exportados pelo pacote interno **`@alaska/contracts`** (`packages/contracts`).

### 1. Papel do `@alaska/contracts` no Backend NestJS

O pacote `@alaska/contracts` será o **Single Source of Truth** para todos os schemas Zod e DTOs de entrada e saída:

```
                               ┌────────────────────────────────┐
                               │      @alaska/contracts         │
                               │   (Zod Schemas + TS Types)     │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                      ┌──────────────────────────────────────────────────┐
                      │                 BACKEND NESTJS                   │
                      │                 (apps/api)                       │
                      ├──────────────────────────────────────────────────┤
                      │ • ZodValidationPipe consome Schemas do Pacote    │
                      │ • Controllers tipados com DTOs inferidos         │
                      │ • Mappers convertem Schemas em Entidades Core    │
                      │ • Schemas de ferramentas MCP derivados de Zod    │
                      └──────────────────────────────────────────────────┘
```

1. **Validação nos Controllers**: O `ZodValidationPipe` passa a validar as requisições HTTP (`body`, `query`, `params`) diretamente contra os schemas de `@alaska/contracts` (ex: `CreateOrderSchema`, `CreateBookingSchema`, `PixQrCodeRequestSchema`).
2. **Isolamento da Camada de Domínio**: As entidades de domínio (`Tenant`, `Product`, `Order`, `Booking`) e Value Objects (`Money`, `Address`) continuam puras em `src/core/domain/`, sendo instanciadas a partir dos dados validados pelos contratos compartilhados.
3. **Ferramentas MCP (Model Context Protocol)**: As ferramentas de IA expostas pelo backend utilizam as mesmas definições Zod para extração OCR de cardápios e provisionamento de lojas.

---

## 2. Estrutura Canônica dos Módulos do Pacote

* **`@alaska/contracts/tenant`**: `TenantSchema`, `TenantCategorySchema`, `TenantThemeSchema`, `OpeningHoursSchema`, `PixConfigSchema`, `StoreReviewsSchema`.
* **`@alaska/contracts/catalog`**: `ProductSchema`, `CategorySchema`, `OptionGroupSchema`, `OptionItemSchema`.
* **`@alaska/contracts/order`**: `CreateOrderSchema`, `OrderItemSchema`, `DeliveryTypeSchema`, `PaymentMethodSchema`, `OrderStatusSchema`.
* **`@alaska/contracts/booking`**: `CreateBookingSchema`, `BookingServiceSchema`, `ProfessionalSchema`, `BookingSlotSchema`.
* **`@alaska/contracts/pix`**: `PixQrCodeRequestSchema`, `PixQrCodeResponseSchema`, `PixKeySchema`.
* **`@alaska/contracts/common`**: `AddressSchema`, `CepSchema`, `PhoneSchema`, `MoneyCentsSchema`.

---

## 3. Estratégia de Build e Docker no Monorepo

Para manter o build do backend otimizado em ambientes de produção (Docker, VPS, Railway, Coolify):
* Utilizaremos o utilitário `turbo prune --scope=api --docker`.
* O `Dockerfile` multi-stage copia apenas o subconjunto de pacotes necessários (`packages/contracts` e `apps/api`), garantindo camadas de cache eficientes e imagens Docker enxutas.

---

## Consequências

### Positivas
* **Sincronização Absoluta**: Qualquer modificação em um schema Zod reflete instantaneamente nas rotas do backend e nas vitrines do frontend.
* **Testes Integrados no Vitest**: É possível testar o fluxo de ponta a ponta (Contrato -> Controller -> Use Case -> Postgres RLS) com execução em milissegundos.
* **Alinhamento com Clean Architecture**: A camada de infraestrutura/HTTP usa os contratos de transporte de dados enquanto o núcleo de negócio permanece desacoplado e protegido.

### Negativas / Mitigações
* **Migração de Estrutura**: Requer alocar o código em `apps/api`. O repositório PostgreSQL e as migrações/seeds continuam preservados sem impacto no banco de dados.

---

## Plano de Implementação

1. **Fase 1**: Documentação técnica e criação da ADR (esta decisão).
2. **Fase 2**: Criação do workspace `packages/contracts` com `tsup` e exports Zod.
3. **Fase 3**: Configuração dos workspaces raiz e `turbo.json`.
4. **Fase 4**: Migração do backend para `apps/api` e substituição dos DTOs internos pelos schemas de `@alaska/contracts`.
5. **Fase 5**: Validação de 100% das suítes de teste Vitest em modo verde (*Green*).
