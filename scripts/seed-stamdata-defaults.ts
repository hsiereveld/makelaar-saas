import { db } from '../lib/db'
import { stamdataCategories, tenantMasterData, tenants } from '../lib/db/schema'

async function seedStamdataDefaults() {
  console.log('🌱 Seeding stamdata categories and defaults...')

  try {
    // First, initialize the system categories
    const categories = [
      {
        key: 'property_types',
        label: 'Property Types',
        description: 'Soorten vastgoed die je aanbiedt (Villa, Appartement, etc.)',
        icon: '🏠',
        isSystemCategory: true,
        sortOrder: 1
      },
      {
        key: 'spanish_regions',
        label: 'Spaanse Regio\'s', 
        description: 'Regio\'s waar je panden aanbiedt in Spanje',
        icon: '🗺️',
        isSystemCategory: true,
        sortOrder: 2
      },
      {
        key: 'property_amenities',
        label: 'Pand Voorzieningen',
        description: 'Alle mogelijke voorzieningen die je panden kunnen hebben',
        icon: '🏊',
        isSystemCategory: true,
        sortOrder: 3
      },
      {
        key: 'property_utilities',
        label: 'Nutsvoorzieningen',
        description: 'Gas, water, licht en andere voorzieningen',
        icon: '⚡',
        isSystemCategory: true,
        sortOrder: 4
      },
      {
        key: 'investment_types',
        label: 'Investering Types',
        description: 'Soorten investeringen (vakantiehuis, pensioen, verhuur)',
        icon: '💰',
        isSystemCategory: true,
        sortOrder: 5
      },
      {
        key: 'target_audiences',
        label: 'Doelgroepen',
        description: 'Nationaliteiten en doelgroepen van klanten',
        icon: '🌍',
        isSystemCategory: true,
        sortOrder: 6
      },
      {
        key: 'client_types',
        label: 'Client Types',
        description: 'Categorieën van klanten (koper, verkoper, investeerder)',
        icon: '👥',
        isSystemCategory: true,
        sortOrder: 7
      },
      {
        key: 'lead_sources',
        label: 'Lead Bronnen',
        description: 'Kanalen waar klanten vandaan komen',
        icon: '📈',
        isSystemCategory: true,
        sortOrder: 8
      },
      {
        key: 'client_tags',
        label: 'Client Tags',
        description: 'Labels en tags voor client segmentatie',
        icon: '🏷️',
        isSystemCategory: false,
        sortOrder: 9
      }
    ]

    // Insert categories
    for (const category of categories) {
      await db.insert(stamdataCategories).values(category).onConflictDoNothing()
    }

    console.log('✅ Stamdata categories initialized')

    // Get all existing tenants to seed their stamdata
    const existingTenants = await db.select().from(tenants)
    
    console.log(`📋 Seeding default stamdata for ${existingTenants.length} tenants...`)

    // Default stamdata based on FoxVillas, CasaFlow, IkZoekEenHuis analysis
    const defaultStamdataItems = [
      // Property Types (FoxVillas/IkZoekEenHuis)
      { category: 'property_types', key: 'villa', label: 'Villa', labelEn: 'Villa', icon: '🏖️', description: 'Vrijstaande villa met eigen tuin', sortOrder: 1, isDefault: true, isPopular: true, metadata: { color: '#059669', targetMarket: 'luxury' } },
      { category: 'property_types', key: 'apartment', label: 'Appartement', labelEn: 'Apartment', icon: '🏢', description: 'Appartement of flat', sortOrder: 2, isDefault: true, isPopular: true, metadata: { color: '#1d4ed8', targetMarket: 'general' } },
      { category: 'property_types', key: 'townhouse', label: 'Stadshuis', labelEn: 'Townhouse', icon: '🏘️', description: 'Rijtjeshuis of stadshuis', sortOrder: 3, isDefault: true, metadata: { color: '#7c3aed' } },
      { category: 'property_types', key: 'finca', label: 'Finca', labelEn: 'Finca', icon: '🌿', description: 'Landelijk pand met veel grond', sortOrder: 4, isDefault: true, metadata: { color: '#059669', targetMarket: 'rural' } },
      { category: 'property_types', key: 'penthouse', label: 'Penthouse', labelEn: 'Penthouse', icon: '🏙️', description: 'Luxe penthouse met uitzicht', sortOrder: 5, isDefault: true, metadata: { color: '#dc2626', targetMarket: 'luxury' } },
      { category: 'property_types', key: 'duplex', label: 'Duplex', labelEn: 'Duplex', icon: '🏠', description: 'Twee verdiepingen appartement', sortOrder: 6, isDefault: true },

      // Spanish Regions (Popular with Dutch buyers from IkZoekEenHuis)
      { category: 'spanish_regions', key: 'costa_blanca', label: 'Costa Blanca', icon: '🏖️', description: 'Populair bij Nederlandse kopers (Alicante)', sortOrder: 1, isDefault: true, isPopular: true, metadata: { transferTax: 8, province: 'Alicante', dutchPopular: true } },
      { category: 'spanish_regions', key: 'costa_del_sol', label: 'Costa del Sol', icon: '☀️', description: 'Málaga regio - internationaal populair', sortOrder: 2, isDefault: true, isPopular: true, metadata: { transferTax: 10, province: 'Málaga', englishPopular: true } },
      { category: 'spanish_regions', key: 'costa_calida', label: 'Costa Cálida', icon: '🌊', description: 'Murcia - goede prijs/kwaliteit verhouding', sortOrder: 3, isDefault: true, isPopular: true, metadata: { transferTax: 8, province: 'Murcia', belgianPopular: true } },
      { category: 'spanish_regions', key: 'costa_brava', label: 'Costa Brava', icon: '🏔️', description: 'Girona - nabij Frankrijk', sortOrder: 4, isDefault: true, metadata: { transferTax: 10, province: 'Girona' } },
      { category: 'spanish_regions', key: 'valencia', label: 'Valencia', icon: '🏛️', description: 'Valencia stad en provincie', sortOrder: 5, isDefault: true, metadata: { transferTax: 10, province: 'Valencia' } },
      { category: 'spanish_regions', key: 'balearic_islands', label: 'Balearen', icon: '🏝️', description: 'Mallorca, Ibiza, Menorca', sortOrder: 6, isDefault: true, metadata: { transferTax: 10, province: 'Illes Balears', luxury: true } },

      // Property Amenities (FoxVillas comprehensive features)
      { category: 'property_amenities', key: 'private_pool', label: 'Privé Zwembad', labelEn: 'Private Pool', icon: '🏊', description: 'Eigen zwembad bij het pand', sortOrder: 1, isDefault: true, isPopular: true, metadata: { category: 'outdoor', dutchAppeal: 'high', priority: 'high' } },
      { category: 'property_amenities', key: 'shared_pool', label: 'Gedeeld Zwembad', labelEn: 'Shared Pool', icon: '🏊‍♀️', description: 'Gemeenschappelijk zwembad', sortOrder: 2, isDefault: true, metadata: { category: 'outdoor' } },
      { category: 'property_amenities', key: 'sea_view', label: 'Zeezicht', labelEn: 'Sea View', icon: '🌊', description: 'Uitzicht op de zee', sortOrder: 3, isDefault: true, isPopular: true, metadata: { category: 'view', dutchAppeal: 'very_high', priceImpact: 'high' } },
      { category: 'property_amenities', key: 'mountain_view', label: 'Bergzicht', labelEn: 'Mountain View', icon: '🏔️', description: 'Uitzicht op de bergen', sortOrder: 4, isDefault: true, metadata: { category: 'view' } },
      { category: 'property_amenities', key: 'panoramic_view', label: 'Panoramisch Uitzicht', labelEn: 'Panoramic View', icon: '🌅', description: 'Weids panoramisch uitzicht', sortOrder: 5, isDefault: true, metadata: { category: 'view', priceImpact: 'high' } },
      { category: 'property_amenities', key: 'garden', label: 'Tuin', labelEn: 'Garden', icon: '🌳', description: 'Eigen tuin bij het pand', sortOrder: 6, isDefault: true, isPopular: true, metadata: { category: 'outdoor' } },
      { category: 'property_amenities', key: 'terrace', label: 'Terras', labelEn: 'Terrace', icon: '🪴', description: 'Overdekt of open terras', sortOrder: 7, isDefault: true, isPopular: true, metadata: { category: 'outdoor' } },
      { category: 'property_amenities', key: 'balcony', label: 'Balkon', labelEn: 'Balcony', icon: '🏠', description: 'Balkon aan het appartement', sortOrder: 8, isDefault: true, metadata: { category: 'outdoor' } },
      { category: 'property_amenities', key: 'garage', label: 'Garage', labelEn: 'Garage', icon: '🚗', description: 'Afgesloten garage voor auto', sortOrder: 9, isDefault: true, isPopular: true, metadata: { category: 'parking', dutchNeed: 'high' } },
      { category: 'property_amenities', key: 'parking_space', label: 'Parkeerplaats', labelEn: 'Parking Space', icon: '🚙', description: 'Aangewezen parkeerplaats', sortOrder: 10, isDefault: true, metadata: { category: 'parking' } },
      { category: 'property_amenities', key: 'storage_room', label: 'Berging', labelEn: 'Storage Room', icon: '📦', description: 'Extra opslag ruimte', sortOrder: 11, isDefault: true, metadata: { category: 'storage' } },
      { category: 'property_amenities', key: 'air_conditioning', label: 'Airconditioning', labelEn: 'Air Conditioning', icon: '❄️', description: 'Koeling voor warme dagen', sortOrder: 12, isDefault: true, isPopular: true, metadata: { category: 'climate', dutchNeed: 'very_high', spanishEssential: true } },
      { category: 'property_amenities', key: 'central_heating', label: 'Centrale Verwarming', labelEn: 'Central Heating', icon: '🔥', description: 'C.V. installatie', sortOrder: 13, isDefault: true, isPopular: true, metadata: { category: 'climate', dutchNeed: 'high' } },
      { category: 'property_amenities', key: 'fireplace', label: 'Open Haard', labelEn: 'Fireplace', icon: '🔥', description: 'Open haard in woonkamer', sortOrder: 14, isDefault: true, metadata: { category: 'climate', ambiance: true } },
      { category: 'property_amenities', key: 'solar_panels', label: 'Zonnepanelen', labelEn: 'Solar Panels', icon: '☀️', description: 'Duurzame energie opwekking', sortOrder: 15, isDefault: true, metadata: { category: 'energy', trending: true, dutchAppeal: 'high' } },
      
      // Utilities (Spanish property essentials)
      { category: 'property_utilities', key: 'electricity', label: 'Elektriciteit', labelEn: 'Electricity', icon: '⚡', description: 'Stroomvoorziening aangesloten', sortOrder: 1, isDefault: true, isPopular: true, metadata: { essential: true } },
      { category: 'property_utilities', key: 'water', label: 'Water', labelEn: 'Water', icon: '💧', description: 'Watervoorziening aangesloten', sortOrder: 2, isDefault: true, isPopular: true, metadata: { essential: true } },
      { category: 'property_utilities', key: 'internet', label: 'Internet', labelEn: 'Internet', icon: '📡', description: 'Internetverbinding beschikbaar', sortOrder: 3, isDefault: true, isPopular: true, metadata: { dutchNeed: 'very_high', remoteWork: true } },
      { category: 'property_utilities', key: 'gas', label: 'Gas', labelEn: 'Gas', icon: '🔥', description: 'Gasleiding aangesloten', sortOrder: 4, isDefault: true, metadata: { cookingHeating: true } },
      { category: 'property_utilities', key: 'satellite_tv', label: 'Satelliet TV', labelEn: 'Satellite TV', icon: '📺', description: 'Satelliet TV ontvangst', sortOrder: 5, isDefault: true },
      { category: 'property_utilities', key: 'security_system', label: 'Beveiligingssysteem', labelEn: 'Security System', icon: '🛡️', description: 'Alarm en beveiligingsinstallatie', sortOrder: 6, isDefault: true, metadata: { luxury: true } },

      // Investment Types (Nederlandse buyer focus)
      { category: 'investment_types', key: 'holiday_home', label: 'Vakantiehuis', labelEn: 'Holiday Home', icon: '🏖️', description: 'Voor vakanties en weekenden', sortOrder: 1, isDefault: true, isPopular: true, metadata: { targetAudience: ['dutch', 'belgian'], seasonalUse: true } },
      { category: 'investment_types', key: 'retirement_property', label: 'Pensioen Woning', labelEn: 'Retirement Property', icon: '🌴', description: 'Voor pensioen in de zon', sortOrder: 2, isDefault: true, isPopular: true, metadata: { targetAudience: ['dutch', 'english'], ageGroup: '55+' } },
      { category: 'investment_types', key: 'rental_investment', label: 'Verhuur Investering', labelEn: 'Rental Investment', icon: '💰', description: 'Voor verhuur en rendement', sortOrder: 3, isDefault: true, metadata: { targetAudience: ['all'], focusOnYield: true } },
      { category: 'investment_types', key: 'permanent_residence', label: 'Permanente Woning', labelEn: 'Permanent Residence', icon: '🏠', description: 'Voor permanent wonen in Spanje', sortOrder: 4, isDefault: true, metadata: { targetAudience: ['all'], legalRequirements: true } },

      // Target Audiences (International buyers)
      { category: 'target_audiences', key: 'dutch', label: 'Nederlandse Klanten', labelEn: 'Dutch Clients', icon: '🇳🇱', description: 'Klanten uit Nederland', sortOrder: 1, isDefault: true, isPopular: true, metadata: { language: 'nl', currency: 'EUR', marketShare: 'high' } },
      { category: 'target_audiences', key: 'english', label: 'Engelse Klanten', labelEn: 'English Clients', icon: '🇬🇧', description: 'Klanten uit Engeland', sortOrder: 2, isDefault: true, isPopular: true, metadata: { language: 'en', currency: 'GBP', marketShare: 'high' } },
      { category: 'target_audiences', key: 'belgian', label: 'Belgische Klanten', labelEn: 'Belgian Clients', icon: '🇧🇪', description: 'Klanten uit België', sortOrder: 3, isDefault: true, isPopular: true, metadata: { language: 'nl', currency: 'EUR', marketShare: 'medium' } },
      { category: 'target_audiences', key: 'german', label: 'Duitse Klanten', labelEn: 'German Clients', icon: '🇩🇪', description: 'Klanten uit Duitsland', sortOrder: 4, isDefault: true, metadata: { language: 'de', currency: 'EUR' } },
      { category: 'target_audiences', key: 'french', label: 'Franse Klanten', labelEn: 'French Clients', icon: '🇫🇷', description: 'Klanten uit Frankrijk', sortOrder: 5, isDefault: true, metadata: { language: 'fr', currency: 'EUR' } },

      // Client Types
      { category: 'client_types', key: 'buyer', label: 'Koper', labelEn: 'Buyer', icon: '🛒', description: 'Klant die vastgoed wil kopen', sortOrder: 1, isDefault: true, isPopular: true },
      { category: 'client_types', key: 'seller', label: 'Verkoper', labelEn: 'Seller', icon: '🏷️', description: 'Klant die vastgoed wil verkopen', sortOrder: 2, isDefault: true },
      { category: 'client_types', key: 'investor', label: 'Investeerder', labelEn: 'Investor', icon: '💼', description: 'Klant gericht op belegging', sortOrder: 3, isDefault: true, metadata: { focus: 'yield', analytical: true } },
      { category: 'client_types', key: 'relocator', label: 'Relocator', labelEn: 'Relocator', icon: '✈️', description: 'Verhuist voor werk of leven', sortOrder: 4, isDefault: true, metadata: { urgency: 'high', timeline: 'short' } },
      { category: 'client_types', key: 'retiree', label: 'Pensionado', labelEn: 'Retiree', icon: '🌅', description: 'Gepensioneerde koper', sortOrder: 5, isDefault: true, metadata: { ageGroup: '55+', lifestyle: 'leisure' } },

      // Lead Sources (Nederlandse makelaar channels)
      { category: 'lead_sources', key: 'website', label: 'Website', icon: '🌐', description: 'Direct via agency website', sortOrder: 1, isDefault: true, isPopular: true, metadata: { digital: true, trackable: true } },
      { category: 'lead_sources', key: 'referral', label: 'Doorverwijzing', labelEn: 'Referral', icon: '🤝', description: 'Doorverwijzing van bestaande klant', sortOrder: 2, isDefault: true, isPopular: true, metadata: { quality: 'high', conversionRate: 'high' } },
      { category: 'lead_sources', key: 'social_media', label: 'Social Media', icon: '📱', description: 'Facebook, Instagram, LinkedIn', sortOrder: 3, isDefault: true, metadata: { digital: true, demographic: 'younger' } },
      { category: 'lead_sources', key: 'google_ads', label: 'Google Advertenties', labelEn: 'Google Ads', icon: '🎯', description: 'Google Ads campagnes', sortOrder: 4, isDefault: true, metadata: { digital: true, paidTraffic: true } },
      { category: 'lead_sources', key: 'property_portals', label: 'Vastgoed Portals', labelEn: 'Property Portals', icon: '🏠', description: 'Funda, Idealista, Kyero', sortOrder: 5, isDefault: true, metadata: { thirdParty: true } },
      { category: 'lead_sources', key: 'direct_inquiry', label: 'Direct Contact', labelEn: 'Direct Inquiry', icon: '📞', description: 'Direct telefonisch of email contact', sortOrder: 6, isDefault: true },
      { category: 'lead_sources', key: 'networking', label: 'Netwerk', labelEn: 'Networking', icon: '🤝', description: 'Professioneel netwerk en events', sortOrder: 7, isDefault: true },

      // Client Tags (Nederlandse segmentation)
      { category: 'client_tags', key: 'hot_lead', label: 'Hot Lead', icon: '🔥', description: 'Zeer geïnteresseerde klant', sortOrder: 1, isDefault: true, isPopular: true, metadata: { priority: 'urgent', color: '#dc2626' } },
      { category: 'client_tags', key: 'villa_specialist', label: 'Villa Specialist', icon: '🏖️', description: 'Zoekt specifiek villa\'s', sortOrder: 2, isDefault: true, metadata: { propertyFocus: 'villa', budget: 'high' } },
      { category: 'client_tags', key: 'first_time_buyer', label: 'Eerste Koop', labelEn: 'First Time Buyer', icon: '🆕', description: 'Eerste keer Spaans vastgoed', sortOrder: 3, isDefault: true, metadata: { needsGuidance: true, education: 'high' } },
      { category: 'client_tags', key: 'cash_buyer', label: 'Cash Koper', labelEn: 'Cash Buyer', icon: '💵', description: 'Koopt zonder financiering', sortOrder: 4, isDefault: true, metadata: { speed: 'fast', priority: 'high' } },
      { category: 'client_tags', key: 'vip_client', label: 'VIP Klant', labelEn: 'VIP Client', icon: '⭐', description: 'Premium service klant', sortOrder: 5, isDefault: true, metadata: { serviceLevel: 'premium', priority: 'highest' } }
    ]

    // Seed for each tenant
    for (const tenant of existingTenants) {
      console.log(`  📊 Seeding stamdata for tenant: ${tenant.name} (${tenant.slug})`)
      
      for (const item of defaultStamdataItems) {
        await db.insert(tenantMasterData).values({
          tenantId: tenant.id,
          ...item,
          isActive: true
        }).onConflictDoNothing() // Skip if already exists
      }
    }

    console.log('✅ Default stamdata seeded for all tenants')

    // Summary
    const totalItems = defaultStamdataItems.length
    const totalTenants = existingTenants.length
    
    console.log(`📈 Stamdata Summary:`)
    console.log(`   - ${categories.length} categories initialized`)
    console.log(`   - ${totalItems} default items per tenant`)
    console.log(`   - ${totalTenants} tenants seeded`)
    console.log(`   - ${totalItems * totalTenants} total stamdata items created`)

  } catch (error) {
    console.error('❌ Error seeding stamdata defaults:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedStamdataDefaults()
    .then(() => {
      console.log('🎉 Stamdata defaults seed completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Stamdata defaults seed failed:', error)
      process.exit(1)
    })
}

export { seedStamdataDefaults }