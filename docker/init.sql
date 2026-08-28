-- Script de Inicialização do PostgreSQL 16 com RLS para o Alaska Local
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Tenants
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phone_whatsapp VARCHAR(20) NOT NULL,
    address TEXT,
    business_category VARCHAR(20) NOT NULL CHECK (business_category IN ('menu', 'shop', 'hub', 'pro')),
    theme VARCHAR(30) DEFAULT 'food',
    custom_domain VARCHAR(255) UNIQUE,
    opening_hours JSONB,
    pix_config JSONB,
    delivery_fee_cents INT DEFAULT 0,
    min_order_value_cents INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Produtos / Serviços
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_cents INT NOT NULL CHECK (price_cents >= 0),
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    option_groups JSONB DEFAULT '[]'::jsonb,
    duration_minutes INT DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
    address JSONB,
    items JSONB NOT NULL,
    subtotal_cents INT NOT NULL,
    delivery_fee_cents INT DEFAULT 0,
    total_cents INT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    change_for_cents INT,
    status VARCHAR(30) DEFAULT 'created',
    pix_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Agendamentos (Bookings)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    services JSONB NOT NULL,
    professional_id VARCHAR(100),
    professional_name VARCHAR(255),
    booking_date DATE NOT NULL,
    booking_time VARCHAR(10) NOT NULL,
    total_price_cents INT NOT NULL,
    total_duration_minutes INT NOT NULL,
    payment_mode VARCHAR(30) DEFAULT 'on_service',
    deposit_amount_cents INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices de Performance Multi-Tenant
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_date ON bookings(tenant_id, booking_date);

-- Habilitação de RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
