# Arquitetura de Monorepo e Contratos Compartilhados (@alaska/contracts)

Este documento detalha o padrão técnico, a organização de workspaces e a especificação de schemas Zod para a unificação do ecossistema **Alaska Local** em um Monorepo gerenciado por **Turborepo** e **Workspaces (pnpm/npm)**.

---

## 1. Visão Geral da Arquitetura

O Monorepo consolida as aplicações de backend (NestJS 11) e frontend (Nuxt 3) juntamente com o pacote de domínio compartilhado (`@alaska/contracts`), garantindo **End-to-End Type Safety** em tempo de compilação e validação **Fail-Fast** em tempo de execução.

```
alaska-local/                                 (Repositório Git Unificado)
├── apps/
│   ├── api/                                 # Backend NestJS 11 (Clean Architecture & RLS)
│   │   ├── src/
│   │   │   ├── core/ (Domain, Application, Ports)
│   │   │   └── infrastructure/ (Postgres, HTTP, BullMQ, MCP)
│   │   ├── docker/
│   │   ├── nest-cli.json
│   │   └── package.json                     # "@alaska/contracts": "workspace:*"
│   │
│   └── web/                                 # Frontend Nuxt 3 (One Codebase, Infinite Domains)
│       ├── components/
│       ├── composables/
│       ├── pages/
│       ├── server/
│       ├── nuxt.config.ts
│       └── package.json                     # "@alaska/contracts": "workspace:*"
│
├── packages/
│   ├── contracts/                           # @alaska/contracts (Single Source of Truth)
│   │   ├── src/
│   │   │   ├── tenant/                      # TenantSchema, OpeningHours, PixConfig, Theme
│   │   │   ├── catalog/                     # ProductSchema, Category, OptionGroups
│   │   │   ├── order/                       # CreateOrderSchema, OrderItem, Status, Delivery
│   │   │   ├── booking/                     # CreateBookingSchema, Services, Professionals, Slots
│   │   │   ├── pix/                         # PixQrCodeRequest, PixQrCodeResponse, PixKey
│   │   │   ├── common/                      # AddressSchema, CepSchema, MoneyCentsSchema
│   │   │   └── index.ts                     # Ponto de entrada unificado
│   │   ├── tsup.config.ts                   # Compilador híbrido ESM/CJS com .d.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── tsconfig/                            # Configurações TypeScript base compartilhadas
│       ├── base.json
│       ├── nuxt.json
│       ├── nest.json
│       └── package.json
│
├── package.json                             # Workspaces raiz e scripts de orquestração
├── pnpm-workspace.yaml                      # Definição de pacotes pnpm
└── turbo.json                               # Pipeline de build e testes com cache inteligente
```

---

## 2. Especificação Detalhada dos Schemas (`@alaska/contracts`)

O pacote `@alaska/contracts` utiliza **TypeScript estrito** e **Zod 3.24** como motor de validação.

### A. Módulo `tenant` (`@alaska/contracts/tenant`)
* **`TenantCategorySchema`**: Enum `'menu' | 'shop' | 'hub' | 'pro'`.
* **`TenantThemeSchema`**: Enum dos 11 temas cromáticos (`'food' | 'barber' | 'health' | 'drinks' | 'rose' | 'amber' | 'violet' | 'blue' | 'emerald' | 'slate' | 'default'`).
* **`OpeningHoursDaySchema`**: `{ open: string, close: string, closed?: boolean }`.
* **`OpeningHoursSchema`**: Mapeamento dos 7 dias da semana (`monday` a `sunday`) com suporte a turnos noturnos.
* **`PixConfigSchema`**: `{ key: string, keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random', name: string, city: string, allowTestCent?: boolean }`.
* **`StoreReviewsSchema`**: `{ rating: number, totalReviews: number, badge: string, distribution: Record<number, number>, highlights?: Array<{ author: string, comment: string, rating: number, date: string }> }`.
* **`TenantSchema`**: Agregação completa de metadados, slug, domínios customizados, telefone WhatsApp, endereço, temas, horários e configurações financeiras.

### B. Módulo `catalog` (`@alaska/contracts/catalog`)
* **`OptionItemSchema`**: `{ id: string, name: string, price: number, description?: string, isAvailable?: boolean }`.
* **`OptionGroupSchema`**: `{ id: string, name: string, required: boolean, min: number, max: number, items: OptionItem[] }`.
* **`ProductSchema`**: `{ id: string, name: string, description: string, price: number, originalPrice?: number, categoryId: string, image?: string, isAvailable: boolean, options?: OptionGroup[], durationMinutes?: number }`.
* **`CategorySchema`**: `{ id: string, name: string, icon?: string, order: number }`.

### C. Módulo `order` (`@alaska/contracts/order`)
* **`DeliveryTypeSchema`**: Enum `'delivery' | 'pickup'`.
* **`PaymentMethodSchema`**: Enum `'pix' | 'money' | 'credit' | 'debit'`.
* **`OrderStatusSchema`**: Enum `'created' | 'confirmed' | 'dispatched' | 'completed' | 'cancelled'`.
* **`OrderItemSchema`**: `{ productId: string, name: string, quantity: number, unitPrice: number, selectedOptions?: Array<{ groupName: string, itemName: string, price: number }>, observation?: string }`.
* **`CreateOrderSchema`**: Validação de payload de checkout contendo itens, cliente (nome, telefone, endereço), modalidade de entrega, troco (`changeFor`) e método de pagamento.

### D. Módulo `booking` (`@alaska/contracts/booking`)
* **`BookingServiceSchema`**: `{ id: string, name: string, price: number, durationMinutes: number, description?: string }`.
* **`ProfessionalSchema`**: `{ id: string, name: string, role: string, avatar?: string, availableDays: number[] }`.
* **`BookingSlotSchema`**: `{ time: string, isAvailable: boolean }`.
* **`CreateBookingSchema`**: Validação de agendamento contendo serviços selecionados, profissional escolhido, data (`YYYY-MM-DD`), horário (`HH:mm`), cliente e itens de upsell físico.

### E. Módulo `pix` (`@alaska/contracts/pix`)
* **`PixKeyTypeSchema`**: Enum `'cpf' | 'cnpj' | 'email' | 'phone' | 'random'`.
* **`PixQrCodeRequestSchema`**: `{ key: string, keyType: PixKeyType, name: string, city: string, amount: number, txid?: string }`.
* **`PixQrCodeResponseSchema`**: `{ brCode: string, qrCodeDataUrl: string, amount: number, txid: string }`.

### F. Módulo `common` (`@alaska/contracts/common`)
* **`MoneyCentsSchema`**: Inteiro não-negativo representando valores monetários em centavos.
* **`CepSchema`**: String validada de 8 dígitos numéricos formatada ou sanitizada.
* **`AddressSchema`**: `{ street: string, number: string, complement?: string, neighborhood: string, city: string, state: string, zipCode: string }`.

---

## 3. Configuração dos Arquivos Raiz do Monorepo

### A. `package.json` (Raiz)
```json
{
  "name": "alaska-local",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "clean": "turbo clean"
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "typescript": "^5.8.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

### B. `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### C. `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".output/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### D. `packages/contracts/package.json`
```json
{
  "name": "@alaska/contracts",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./tenant": {
      "import": "./dist/tenant/index.js",
      "require": "./dist/tenant/index.cjs",
      "types": "./dist/tenant/index.d.ts"
    },
    "./catalog": {
      "import": "./dist/catalog/index.js",
      "require": "./dist/catalog/index.cjs",
      "types": "./dist/catalog/index.d.ts"
    },
    "./order": {
      "import": "./dist/order/index.js",
      "require": "./dist/order/index.cjs",
      "types": "./dist/order/index.d.ts"
    },
    "./booking": {
      "import": "./dist/booking/index.js",
      "require": "./dist/booking/index.cjs",
      "types": "./dist/booking/index.d.ts"
    },
    "./pix": {
      "import": "./dist/pix/index.js",
      "require": "./dist/pix/index.cjs",
      "types": "./dist/pix/index.d.ts"
    },
    "./common": {
      "import": "./dist/common/index.js",
      "require": "./dist/common/index.cjs",
      "types": "./dist/common/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "dependencies": {
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "tsup": "^8.3.6",
    "typescript": "^5.8.0"
  }
}
```

---

## 4. Guia de Migração Passo a Passo

1. **Passo 1: Criação da Estrutura Raiz**:
   * Criar os diretórios `apps/api`, `apps/web`, `packages/contracts` e `packages/tsconfig`.
2. **Passo 2: Migração do Pacote de Contratos**:
   * Mover e refinar os schemas Zod para `packages/contracts/src/`.
   * Rodar o build inicial do pacote com `tsup`.
3. **Passo 3: Migração do Backend NestJS 11**:
   * Mover o repositório `alaska-local-backend` para `apps/api/`.
   * Adicionar `"@alaska/contracts": "workspace:*"` no `package.json` de `apps/api/`.
   * Atualizar `ZodValidationPipe` e DTOs de controllers para importar os schemas do `@alaska/contracts`.
4. **Passo 4: Migração do Frontend Nuxt 3**:
   * Mover o repositório `Alaska-local` para `apps/web/`.
   * Adicionar `"@alaska/contracts": "workspace:*"` no `package.json` de `apps/web/`.
   * Substituir imports locais `~/types/*` por `@alaska/contracts`.
5. **Passo 5: Validação do Test Harness**:
   * Rodar `turbo test` na raiz e garantir que todas as suítes do Vitest (frontend e backend) estejam passando em modo verde (*Green*).
6. **Passo 6: Ajuste de CI/CD e Deploy**:
   * Atualizar configuração de Root Directory na Vercel para `apps/web`.
   * Atualizar `Dockerfile` do backend com `turbo prune --scope=api --docker`.
