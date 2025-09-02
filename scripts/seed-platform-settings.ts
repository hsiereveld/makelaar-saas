import { db } from '../lib/db'
import { platformSettings } from '../lib/db/schema'

async function seedPlatformSettings() {
  console.log('🌱 Seeding platform settings...')

  try {
    // Check if settings already exist
    const existing = await db.select().from(platformSettings).limit(1)
    
    if (existing.length > 0) {
      console.log('✅ Platform settings already exist, skipping seed')
      return
    }

    const businessSettings = [
      // General Business Information
      {
        key: 'company.name',
        value: 'Makelaar CRM Professional',
        description: 'Bedrijfsnaam zoals getoond op landingpage en emails',
        category: 'general',
        isPublic: true
      },
      {
        key: 'company.description',
        value: 'Professionele CRM voor Nederlandse, Engelse en Belgische makelaars actief in Spanje',
        description: 'Korte beschrijving voor marketing en SEO',
        category: 'general',
        isPublic: true
      },
      {
        key: 'company.phone',
        value: '+31 20 800 1234',
        description: 'Hoofdtelefoon nummer voor klantenservice',
        category: 'general',
        isPublic: true
      },
      {
        key: 'company.email',
        value: 'info@makelaarcrm.nl',
        description: 'Algemeen contact email adres',
        category: 'general',
        isPublic: true
      },
      {
        key: 'company.address',
        value: 'Herengracht 123, 1015 BG Amsterdam',
        description: 'Kantooradres voor legal en contact info',
        category: 'general',
        isPublic: true
      },
      
      // Business Hours
      {
        key: 'business.hours_weekdays',
        value: 'Maandag - Vrijdag: 09:00 - 17:30',
        description: 'Openingstijden doordeweekse dagen',
        category: 'general',
        isPublic: true
      },
      {
        key: 'business.hours_weekend',
        value: 'Zaterdag: 10:00 - 16:00, Zondag: Gesloten',
        description: 'Weekend openingstijden',
        category: 'general',
        isPublic: true
      },
      
      // Billing Configuration
      {
        key: 'billing.currency',
        value: 'EUR',
        description: 'Standaard valuta voor alle prijzen',
        category: 'billing',
        isPublic: true
      },
      {
        key: 'billing.trial_days',
        value: 14,
        description: 'Gratis proefperiode duur in dagen',
        category: 'billing',
        isPublic: true
      },
      {
        key: 'billing.vat_rate',
        value: 21,
        description: 'BTW percentage (Nederlandse standaard)',
        category: 'billing',
        isPublic: false
      },
      
      // Email Settings
      {
        key: 'email.support_address',
        value: 'support@makelaarcrm.nl',
        description: 'Support email voor klantenservice',
        category: 'email',
        isPublic: true
      },
      {
        key: 'email.noreply_address',
        value: 'noreply@makelaarcrm.nl',
        description: 'No-reply email voor automatische berichten',
        category: 'email',
        isPublic: false
      },
      {
        key: 'email.from_name',
        value: 'Makelaar CRM Team',
        description: 'Afzender naam voor alle platform emails',
        category: 'email',
        isPublic: false
      },
      
      // Landing Page Content
      {
        key: 'homepage.hero_title',
        value: 'Complete CRM voor Internationale Makelaardij',
        description: 'Hoofdtitel op de landingpage',
        category: 'content',
        isPublic: true
      },
      {
        key: 'homepage.hero_subtitle',
        value: 'Specialist platform voor Nederlandse, Engelse en Belgische makelaars die actief zijn in Spanje',
        description: 'Ondertitel op de landingpage',
        category: 'content',
        isPublic: true
      },
      {
        key: 'homepage.cta_text',
        value: 'Start 14 Dagen Gratis',
        description: 'Tekst op de hoofdactie knop',
        category: 'content',
        isPublic: true
      },
      
      // Social Media & Legal
      {
        key: 'social.linkedin',
        value: 'https://linkedin.com/company/makelaar-crm',
        description: 'LinkedIn bedrijfspagina URL',
        category: 'general',
        isPublic: true
      },
      {
        key: 'legal.kvk_number',
        value: '12345678',
        description: 'KvK nummer voor Nederlandse rechtspersoon',
        category: 'general',
        isPublic: true
      },
      {
        key: 'legal.btw_number',
        value: 'NL123456789B01',
        description: 'BTW nummer voor facturering',
        category: 'general',
        isPublic: true
      },
      
      // Feature Limits
      {
        key: 'limits.trial_properties',
        value: 15,
        description: 'Maximum panden tijdens proefperiode',
        category: 'features',
        isPublic: false
      },
      {
        key: 'limits.trial_users',
        value: 3,
        description: 'Maximum gebruikers tijdens proefperiode',
        category: 'features',
        isPublic: false
      }
    ]

    // Insert settings
    const inserted = await db.insert(platformSettings).values(businessSettings).returning()

    console.log(`✅ Successfully seeded ${inserted.length} platform settings:`)
    inserted.forEach(setting => {
      console.log(`   - ${setting.key}: ${setting.value}`)
    })

  } catch (error) {
    console.error('❌ Error seeding platform settings:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedPlatformSettings()
    .then(() => {
      console.log('🎉 Platform settings seed completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Platform settings seed failed:', error)
      process.exit(1)
    })
}

export { seedPlatformSettings }