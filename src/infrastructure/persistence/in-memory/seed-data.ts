import { Tenant } from '@core/domain/entities/tenant.entity'

export const SEED_TENANTS: Tenant[] = [
  new Tenant({
    id: 'ten-karine-finardi',
    slug: 'karine-finardi',
    name: 'Karine Finardi | Semijoias & Revenda',
    description: 'Semijoias femininas delicadas, hipoalergênicas, banhadas a ouro 18k e prata 925 com garantia.',
    phoneWhatsApp: '11999998888',
    address: 'Francisco Morato – SP',
    businessCategory: 'shop',
    theme: 'rose',
    openingHours: { open: '09:00', close: '19:00' },
    pixConfig: {
      key: '11999998888',
      keyType: 'phone',
      beneficiary: 'Karine Finardi Semijoias',
      city: 'FRANCISCO MORATO',
      depositPercentage: 30
    },
    customDomain: 'karinefinardi.com.br'
  }),
  new Tenant({
    id: 'ten-hamburgueria-x',
    slug: 'hamburgueria-x',
    name: 'Hamburgueria X Monster',
    description: 'Burgers artesanais grelhados na brasa, smashs crocantes e porções exclusivas.',
    phoneWhatsApp: '11987654321',
    address: 'Rua das Hamburguerias, 123 - Centro',
    businessCategory: 'menu',
    theme: 'amber',
    openingHours: { open: '18:00', close: '23:30' },
    pixConfig: {
      key: '11987654321',
      keyType: 'phone',
      beneficiary: 'Hamburgueria X',
      city: 'SAO PAULO'
    },
    customDomain: 'hamburgueria-x.com.br'
  }),
  new Tenant({
    id: 'ten-barbearia-style',
    slug: 'barbearia-style',
    name: 'Barbearia Style Club',
    description: 'Cortes clássicos, visagismo masculino, barba na toalha quente e cuidados premium.',
    phoneWhatsApp: '11977776666',
    address: 'Av. Paulista, 1500 - Jardins',
    businessCategory: 'hub',
    theme: 'violet',
    openingHours: { open: '09:00', close: '20:00' },
    pixConfig: {
      key: '11977776666',
      keyType: 'phone',
      beneficiary: 'Barbearia Style',
      city: 'SAO PAULO',
      depositPercentage: 30
    },
    customDomain: 'barbeariastyle.com.br'
  }),
  new Tenant({
    id: 'ten-clinica-sorriso',
    slug: 'clinica-sorriso',
    name: 'Clínica Sorriso & Odonto',
    description: 'Clínica odontológica e estética orofacial. Implantes, alinhadores invisíveis e clareamento.',
    phoneWhatsApp: '11966665555',
    address: 'Rua Oscar Freire, 800 - Pinheiros',
    businessCategory: 'pro',
    theme: 'blue',
    openingHours: { open: '08:00', close: '18:00' },
    pixConfig: {
      key: '11966665555',
      keyType: 'phone',
      beneficiary: 'Clinica Sorriso',
      city: 'SAO PAULO',
      depositPercentage: 50
    },
    customDomain: 'clinicasorriso.com.br'
  }),
  new Tenant({
    id: 'ten-adega-prime',
    slug: 'adega-prime',
    name: 'Adega Prime 24 Horas',
    description: 'Bebidas premium, gelo, combos exclusivos e atendimento noturno rápido para delivery.',
    phoneWhatsApp: '11955554444',
    address: 'Av. Central, 500 - Centro',
    businessCategory: 'menu',
    theme: 'amber',
    openingHours: { open: '18:00', close: '04:00' },
    pixConfig: {
      key: '11955554444',
      keyType: 'phone',
      beneficiary: 'Adega Prime',
      city: 'SAO PAULO'
    },
    customDomain: 'adegaprime.com.br'
  }),
  new Tenant({
    id: 'ten-bella-donna',
    slug: 'bella-donna',
    name: 'Bella Donna Boutique',
    description: 'Moda feminina contemporânea, alfaiataria elegante, vestidos e acessórios exclusivos.',
    phoneWhatsApp: '11944443333',
    address: 'Rua da Moda, 45 - Vila Madalena',
    businessCategory: 'shop',
    theme: 'rose',
    openingHours: { open: '10:00', close: '19:00' },
    pixConfig: {
      key: '11944443333',
      keyType: 'phone',
      beneficiary: 'Bella Donna Boutique',
      city: 'SAO PAULO'
    },
    customDomain: 'belladonna.com.br'
  })
]
