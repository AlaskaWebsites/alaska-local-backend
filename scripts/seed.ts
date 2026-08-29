import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const databaseUrl = process.env.DATABASE_URL || 'postgres://alaska:alaskapassword@localhost:5432/alaska_local'

async function runSeed() {
  console.log('🌱 Conectando ao PostgreSQL para atualizar dados de demonstração...')
  const pool = new Pool({ connectionString: databaseUrl })

  try {
    const client = await pool.connect()
    console.log('✅ Conectado ao banco de dados!')

    const targetPixKey = '7e3ed5e6-6097-4b15-88a3-221caba64141'
    const targetKeyType = 'random'

    console.log(`🔄 Atualizando chave Pix para: ${targetPixKey} (${targetKeyType}) em todos os estabelecimentos...`)

    // 1. Atualiza todos os registros existentes com a nova chave Pix usando cast explícito ::text
    await client.query(`
      UPDATE tenants 
      SET pix_config = jsonb_build_object(
        'key', $1::text,
        'keyType', $2::text,
        'beneficiary', name,
        'city', 'SAO PAULO'::text,
        'allowTestCent', true,
        'depositPercentage', 30
      );
    `, [targetPixKey, targetKeyType])

    // 2. Garante o upsert dos principais estabelecimentos com dados completos
    await client.query(`
      INSERT INTO tenants (id, slug, name, description, phone_whatsapp, address, business_category, theme, custom_domain, opening_hours, pix_config, delivery_fee_cents, min_order_value_cents)
      VALUES 
      (
        'ten-adega-prime', 'adega-prime', 'Adega & Distribuidora Prime',
        'Cervejas trincando, combos de destilados, gelos de sabor, carvão e conveniência com entrega rápida.',
        '11988889999', 'Av. Brasil, 850 - Centro', 'menu', 'amber', 'adegaprime.com.br',
        '{"open": "14:00", "close": "03:00"}'::jsonb,
        '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Adega & Distribuidora Prime", "city": "SAO PAULO", "allowTestCent": true, "depositPercentage": 30}'::jsonb,
        600, 2000
      ),
      (
        'ten-karine-finardi', 'karine-finardi', 'Karine Finardi | Semijoias & Revenda',
        'Semijoias femininas delicadas, hipoalergênicas, banhadas a ouro 18k e prata 925 com garantia de 1 ano.',
        '11999998888', 'Francisco Morato – SP', 'shop', 'barber', 'karinefinardi.com.br',
        '{"open": "09:00", "close": "19:00"}'::jsonb,
        '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Karine Finardi Semijoias", "city": "FRANCISCO MORATO", "allowTestCent": true, "depositPercentage": 30}'::jsonb,
        0, 0
      ),
      (
        'ten-barbearia-style', 'barbearia-style', 'Barbearia Style',
        'Cortes modernos, barba com toalha quente, pigmentação e estética masculina.',
        '11977776666', 'Rua das Barbearias, 456 - Centro', 'hub', 'barber', 'barbeariastyle.com.br',
        '{"open": "09:00", "close": "20:00"}'::jsonb,
        '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Barbearia Style", "city": "SAO PAULO", "allowTestCent": true, "depositPercentage": 30}'::jsonb,
        0, 0
      ),
      (
        'ten-hamburgueria-x', 'hamburgueria-x', 'Hamburgueria X',
        'Burgers artesanais grelhados na brasa, smashs crocantes e porções exclusivas.',
        '11999999999', 'Rua das Hamburguerias, 123 - Centro', 'menu', 'food', 'hamburgueria-x.com.br',
        '{"open": "18:00", "close": "23:30"}'::jsonb,
        '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Hamburgueria X Artesanal", "city": "SAO PAULO", "allowTestCent": true, "depositPercentage": 30}'::jsonb,
        500, 2000
      ),
      (
        'ten-clinica-sorriso', 'clinica-sorriso', 'Clínica Sorriso',
        'Odontologia moderna com foco em estética, implantes e saúde bucal.',
        '11966665555', 'Rua da Saúde, 321 - Centro', 'pro', 'health', 'clinicasorriso.com.br',
        '{"open": "08:00", "close": "19:00"}'::jsonb,
        '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Clínica Sorriso Odontologia", "city": "SAO PAULO", "allowTestCent": true, "depositPercentage": 30}'::jsonb,
        0, 0
      ),
      (
        'ten-bella-donna', 'bella-donna', 'Bella Donna Boutique | Moda Feminina',
        'Moda feminina casual chic, conjuntos de alfaiataria em crepe duna, vestidos fluidos e peças do P ao GG.',
        '11977778888', 'Rua Gerônimo Caetano Garcia, 280 – Centro, Francisco Morato - SP', 'shop', 'drinks', 'belladonna.com.br',
        '{"open": "09:00", "close": "19:00"}'::jsonb,
        '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Bella Donna Boutique", "city": "FRANCISCO MORATO", "allowTestCent": true, "depositPercentage": 30}'::jsonb,
        500, 3000
      ),
      (
        'ten-cafe-central', 'cafe-central', 'Café Central',
        'O melhor café da cidade, ambiente acolhedor e doces artesanais.',
        '11988887777', 'Rua do Café, 123 - Centro', 'menu', 'food', 'cafecentral.com.br',
        '{"open": "07:00", "close": "20:00"}'::jsonb,
        '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Café Central", "city": "SAO PAULO", "allowTestCent": true, "depositPercentage": 30}'::jsonb,
        400, 1500
      ),
      (
        'ten-espetaria-brasa', 'espetaria-brasa', 'Espetaria & Jantinha Brasa Nobre',
        'Espetinhos artesanais na brasa, jantinhas completas, acompanhamentos caseiros e cervejas estupidamente geladas.',
        '11999999999', 'Av. dos Churrasqueiros, 450 - Centro', 'menu', 'food', 'espetariabrasa.com.br',
        '{"open": "18:00", "close": "23:45"}'::jsonb,
        '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Espetaria & Jantinha Brasa Nobre", "city": "SAO PAULO", "allowTestCent": true, "depositPercentage": 30}'::jsonb,
        600, 2500
      ),
      (
        'ten-restaurante-bella-italia', 'restaurante-bella-italia', 'Bella Italia',
        'Autêntica culinária italiana no coração da cidade.',
        '5511999999999', 'Rua da Pizza, 789 - Centro', 'menu', 'food', 'bellaitalia.com.br',
        '{"open": "18:00", "close": "23:00"}'::jsonb,
        '{"key": "7e3ed5e6-6097-4b15-88a3-221caba64141", "keyType": "random", "beneficiary": "Restaurante Bella Italia", "city": "SAO PAULO", "allowTestCent": true, "depositPercentage": 30}'::jsonb,
        800, 3000
      )
      ON CONFLICT (slug) DO UPDATE SET 
        pix_config = EXCLUDED.pix_config,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        theme = EXCLUDED.theme,
        business_category = EXCLUDED.business_category,
        delivery_fee_cents = EXCLUDED.delivery_fee_cents,
        min_order_value_cents = EXCLUDED.min_order_value_cents;
    `)

    const result = await client.query('SELECT slug, name, pix_config FROM tenants')
    console.log(`\n🎉 ${result.rows.length} estabelecimentos atualizados com sucesso no PostgreSQL:`)
    for (const row of result.rows) {
      console.log(`   • [${row.slug}] ${row.name}: Pix Key = ${row.pix_config?.key} (${row.pix_config?.keyType})`)
    }

    client.release()
    await pool.end()
    console.log('\n🚀 Seed concluído com sucesso!')
  } catch (err) {
    console.error('❌ Erro ao executar seed:', err)
    process.exit(1)
  }
}

runSeed()
