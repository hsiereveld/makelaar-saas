// Enhanced Property Type based on FoxVillas, CasaFlow, and IkZoekEenHuisInSpanje analysis

export interface EnhancedSpanishProperty {
  // Identification
  id: string
  referenceNumber: string // FOX-R129, REF-001, etc.
  
  // Basic Information (Dutch Marketing)
  title: string // "Schitterende moderne villa met panoramisch zeezicht"
  description: string // Extensive Dutch narrative description
  shortDescription?: string // For cards/previews
  
  // Property Classification
  propertyType: 'villa' | 'apartment' | 'townhouse' | 'finca' | 'penthouse' | 'duplex' | 'studio' | 'land'
  propertySubtype?: string // "Country House", "Beachfront", "Golf Resort", etc.
  status: 'available' | 'reserved' | 'under_offer' | 'sold' | 'off_market' | 'new_build'
  
  // Financial Information
  price: number
  currency: 'EUR' | 'GBP'
  pricePerSqm?: number // Auto-calculated
  priceNegotiable: boolean
  priceReduced?: { originalPrice: number; reducedDate: string }
  
  // Spanish Location (Detailed)
  address: string
  city: string
  region: 'Costa del Sol' | 'Costa Blanca' | 'Costa Brava' | 'Costa Calida' | 'Balearic Islands' | 'Canary Islands' | 'Valencia' | 'Murcia' | 'Andalusia'
  province: 'Alicante' | 'Malaga' | 'Valencia' | 'Murcia' | 'Granada' | 'Almeria' | 'Castellon' | 'Girona'
  municipality: string
  postalCode: string
  country: 'Spain'
  coordinates?: { lat: number; lng: number }
  
  // Property Specifications
  bedrooms: number
  bathrooms: number
  livingArea: number // m² built area
  plotSize?: number // m² land
  terraceArea?: number // m² terrace
  poolArea?: number // m² pool
  builtYear: number
  lastRenovation?: number
  orientation: 'North' | 'South' | 'East' | 'West' | 'Southeast' | 'Southwest' | 'Northeast' | 'Northwest'
  floors: number
  condition: 'new' | 'excellent' | 'good' | 'needs_renovation' | 'renovation_project'
  
  // Spanish Property Features (Based on FoxVillas)
  amenities: {
    // Outdoor
    privatePool?: boolean
    sharedPool?: boolean
    garden?: boolean
    terrace?: boolean
    balcony?: boolean
    roof_terrace?: boolean
    bbq_area?: boolean
    outdoor_kitchen?: boolean
    
    // Parking
    garage?: boolean
    carport?: boolean
    parking_space?: boolean
    electric_gate?: boolean
    
    // Interior
    fireplace?: boolean
    wine_cellar?: boolean
    storage_room?: boolean
    laundry_room?: boolean
    office?: boolean
    gym?: boolean
    guest_house?: boolean
    
    // Views & Location
    sea_view?: boolean
    mountain_view?: boolean
    golf_view?: boolean
    panoramic_view?: boolean
    south_facing?: boolean
    beach_walking_distance?: boolean
  }
  
  // Utilities & Systems (Critical for Spanish properties)
  utilities: {
    electricity?: boolean
    water?: boolean
    internet?: boolean
    gas?: boolean
    satellite_tv?: boolean
    landline?: boolean
    security_system?: boolean
    solar_panels?: boolean
    solar_water_heating?: boolean
    backup_generator?: boolean
  }
  
  // Climate Control (Important for Spanish climate)
  climate: {
    air_conditioning?: boolean
    central_heating?: boolean
    electric_heating?: boolean
    gas_heating?: boolean
    pellet_stove?: boolean
    underfloor_heating?: boolean
    ceiling_fans?: boolean
  }
  
  // Spanish Legal & Financial (IkZoekEenHuis emphasis)
  legal: {
    habitationCertificate: boolean // Cedula de Habitabilidad
    energyRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
    ibi: number // Annual property tax
    communityFees?: number // Monthly
    basura?: number // Waste collection tax
    transferTax?: number // 8% Murcia vs 10% Valencia
    notaryFees?: number
    registrationFees?: number
  }
  
  // Investment Analysis (Dutch buyer focus)
  investment: {
    type: 'permanent_residence' | 'holiday_home' | 'rental_investment' | 'retirement_property' | 'buy_to_let'
    rentalPotential?: {
      weeklyRateHigh: number // Summer season
      weeklyRateLow: number // Winter season  
      monthlyRate: number
      annualYield?: number
      occupancyRate?: number
    }
    appreciationPotential?: 'high' | 'medium' | 'low'
    liquidity?: 'high' | 'medium' | 'low'
  }
  
  // International Buyer Essentials (Based on IkZoekEenHuis)
  distances: {
    alicante_airport?: number // minutes
    valencia_airport?: number // minutes
    malaga_airport?: number // minutes
    madrid_airport?: number // minutes
    
    beach?: number // minutes to nearest beach
    golf_course?: number // minutes to nearest golf
    hospital?: number // minutes to hospital
    supermarket?: number // minutes to supermarket
    restaurant?: number // minutes to restaurants
    town_center?: number // minutes to town center
    highway?: number // minutes to main highway
    train_station?: number // minutes to train
  }
  
  // Dutch Target Market (IkZoekEenHuis approach)
  marketing: {
    targetAudience: 'dutch' | 'english' | 'belgian' | 'german' | 'french' | 'all_eu'
    keySellingPoints: string[] // "Panoramic views", "Private pool", "Turn-key ready"
    lifestyleKeywords: string[] // "Retirement paradise", "Golf lover's dream"
    seasonalAppeals: string[] // "Winter sun", "Summer escape"
    
    // Dutch-specific appeals
    dutchFeatures?: {
      centralHeating?: boolean // Important for Dutch buyers
      doubleGlazing?: boolean // Familiar to Dutch
      modernKitchen?: boolean // Dutch kitchen standards
      fiberInternet?: boolean // Remote work capability
      easyMaintenance?: boolean // Attractive to Dutch
    }
  }
  
  // Media & Marketing
  media: {
    mainImage: string
    images: Array<{
      url: string
      caption?: string
      room?: string // "Living room", "Master bedroom", etc.
      isExterior: boolean
      order: number
    }>
    virtualTour?: string
    floorPlans: string[]
    aerialPhotos: string[]
    videos: string[]
  }
  
  // Performance Tracking (Makelaar Analytics)
  analytics: {
    viewsCount: number
    inquiriesCount: number
    showingsScheduled: number
    favoriteCount: number
    shareCount: number
    conversionRate?: number
    averageTimeOnPage?: number
    
    // Dutch buyer behavior
    dutchViews?: number
    englishViews?: number
    belgianViews?: number
  }
  
  // Nederlandse Makelaar Workflow
  workflow: {
    sourceChannel: 'manual' | 'import' | 'api' | 'referral'
    leadSource?: string
    assignedAgent?: string
    priority: 'low' | 'normal' | 'high' | 'urgent'
    tags: string[] // "Hot property", "Price reduced", "Exclusive"
    internalNotes: string
    clientNotes: string // Visible to clients
    
    // Dutch market specifics
    seasonalMarketing?: boolean // Summer focus for holiday homes
    pensioneerSuitability?: boolean // Retirement suitability
    familyFriendly?: boolean // Family vacation homes
  }
  
  // Timestamps
  createdAt: string
  updatedAt: string
  publishedAt?: string
  lastViewed?: string
  featuredUntil?: string // For premium listings
}

// Search & Filter Types for Dutch Buyers
export interface PropertySearchFilters {
  // Basic Filters
  priceRange: { min?: number; max?: number }
  propertyType: string[]
  bedrooms: { min?: number; max?: number }
  bathrooms: { min?: number; max?: number }
  
  // Spanish Location
  regions: string[]
  provinces: string[]
  cities: string[]
  
  // Dutch Buyer Priorities
  hasPool: boolean
  hasSeaView: boolean
  hasGolf: boolean
  maxAirportDistance: number
  maxBeachDistance: number
  
  // Investment Focus
  investmentTypes: string[]
  maxCommunityFees: number
  hasRentalPotential: boolean
  
  // Property Condition
  conditions: string[]
  minEnergyRating: string
  hasHabitationCertificate: boolean
}

// Property Card Display Data (for listings)
export interface PropertyCardData {
  id: string
  referenceNumber: string
  title: string
  price: number
  currency: string
  priceReduced?: boolean
  
  city: string
  region: string
  
  bedrooms: number
  bathrooms: number
  livingArea: number
  plotSize?: number
  
  mainImage: string
  hasPool: boolean
  hasSeaView: boolean
  
  targetAudience: string
  investmentType: string
  
  // Quick info for Dutch buyers
  airportDistance?: number
  beachDistance?: number
  
  viewsCount: number
  inquiriesCount: number
  
  status: string
  featured: boolean
}