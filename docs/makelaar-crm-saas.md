# Makelaar CRM SaaS Platform - API-First Multi-Tenant Architectuur

## Project Visie
Een krachtig multi-tenant CRM platform voor makelaars dat zich volledig focust op data management, process automation en lead conversie. Makelaars behouden hun eigen website (WordPress, Webflow, custom) en integreren via onze REST API voor real-time property data en lead capture.

## Core Principe: Data Centralisatie, Presentatie Vrijheid
- **Wij leveren**: De beste CRM backend, data management en process automation
- **Makelaars behouden**: Hun eigen website, huisstijl en online identiteit  
- **Integratie via**: REST API, WordPress plugin, Zapier, webhooks
- **Resultaat**: Makelaars upgraden hun backend zonder hun frontend te verliezen

## Architectuur Fundamenten

### Multi-Tenant SaaS Structuur
- **Strikte data isolatie**: Elke makelaar opereert in volledig gescheiden data silo
- **Tenant identificatie**: Via API key + tenant ID in alle requests
- **Resource pooling**: Gedeelde infrastructuur, gescheiden data
- **Elastische schaling**: Automatisch opschalen per tenant bij groei
- **White-label API**: Responses aanpasbaar per tenant branding

### API-First Design
```yaml
Base URL: https://api.makelaarcrm.nl/v1/{tenant-id}/
Authentication: Bearer Token (JWT)
Rate Limiting: 1000 requests/hour per tenant
Response Format: JSON (optional XML voor legacy systems)
Webhooks: Real-time updates naar makelaar systemen
```

## Multi-Tenant Architectuur Details

### Tenant Isolatie Levels

#### Data Isolatie
- **Database level**: Elke tenant heeft eigen schema/namespace
- **Row-level security**: Tenant_id in elke tabel, enforced op DB niveau
- **Storage isolation**: Aparte folders per tenant voor bestanden
- **Cache isolation**: Redis namespacing per tenant
- **Search isolation**: Elasticsearch indices per tenant

#### Tenant Identificatie
```javascript
// Elke API request bevat tenant context
Headers: {
  'X-Tenant-ID': 'tenant_uuid',
  'Authorization': 'Bearer {jwt_with_tenant_claims}'
}

// JWT Token structure
{
  "user_id": "user_123",
  "tenant_id": "tenant_abc",
  "role": "makelaar",
  "permissions": ["read:properties", "write:contacts"],
  "exp": 1234567890
}
```

### Tenant User Management

#### User Hierarchie binnen Tenant
```yaml
Tenant Owner (1 per tenant):
  - Volledige controle over tenant
  - Subscription management
  - Kan tenant verwijderen
  - User management

Tenant Admin (1-5 per tenant):
  - Alle functionaliteit behalve billing
  - User management
  - API key management
  - Workflow configuratie

Makelaar (unlimited):
  - Property management
  - Contact management
  - Lead processing
  - Rapportages

Assistant (unlimited):
  - Beperkte property editing
  - Contact viewing
  - Taak uitvoering
  - Geen delete rechten

Viewer (unlimited):
  - Read-only toegang
  - Rapportages bekijken
  - Geen data wijzigingen
```

#### User Provisioning API
```javascript
POST   /tenants/{id}/users           // Nieuwe gebruiker
PUT    /tenants/{id}/users/{userId}  // Update gebruiker
DELETE /tenants/{id}/users/{userId}  // Verwijder gebruiker
POST   /tenants/{id}/users/bulk      // Bulk import
GET    /tenants/{id}/users/roles     // Beschikbare rollen
POST   /tenants/{id}/users/invite    // Email invite
```

### Tenant-Specifieke Configuratie

#### Customizable Features per Tenant
```javascript
{
  "tenant_settings": {
    "branding": {
      "primary_color": "#FF6B35",
      "logo_url": "https://...",
      "email_signature": "HTML template",
      "api_response_wrapper": "custom_format"
    },
    "features": {
      "ai_matching": true,
      "document_signing": false,
      "multi_language": ["nl", "en"],
      "custom_fields": true,
      "workflow_automation": true
    },
    "limits": {
      "max_users": 10,
      "max_properties": 200,
      "storage_gb": 50,
      "api_calls_per_hour": 1000
    },
    "integrations": {
      "wordpress_plugin": true,
      "funda_sync": true,
      "pararius_sync": false,
      "custom_webhooks": ["url1", "url2"]
    }
  }
}
```

#### Tenant Custom Fields
```javascript
// Elke tenant kan eigen velden definiëren
POST /tenants/{id}/custom-fields
{
  "entity": "property",
  "field_name": "monument_status",
  "field_type": "boolean",
  "required": false,
  "show_in_api": true
}
```

### Tenant Onboarding Flow

#### Automated Provisioning
```javascript
POST /tenants/create
{
  "company_name": "Makelaar Jansen",
  "subdomain": "jansen",
  "owner_email": "info@jansen.nl",
  "plan": "professional"
}

// Response with instant access
{
  "tenant_id": "tenant_uuid",
  "api_keys": {
    "public": "pk_live_...",
    "secret": "sk_live_..."
  },
  "urls": {
    "dashboard": "https://jansen.makelaarcrm.nl",
    "api": "https://api.makelaarcrm.nl/v1/jansen/",
    "wordpress_plugin": "download_link"
  }
}
```

#### Onboarding Checklist
- ✅ Account verificatie
- ✅ Branding setup (logo, kleuren)
- ✅ Eerste gebruikers toevoegen
- ✅ API key generatie
- ✅ WordPress plugin installatie
- ✅ Eerste property import
- ✅ Webhook configuratie
- ✅ Team training scheduled

### Tenant Resource Management

#### Usage Tracking per Tenant
```javascript
GET /tenants/{id}/usage
{
  "period": "2024-01",
  "metrics": {
    "active_users": 8,
    "total_properties": 156,
    "api_calls": 45678,
    "storage_gb": 23.5,
    "emails_sent": 1234,
    "leads_processed": 89
  },
  "limits": {
    "max_users": 10,
    "max_properties": 200,
    "api_calls_limit": 100000,
    "storage_limit_gb": 50
  },
  "overage": {
    "api_calls": 0,
    "storage": 0
  }
}
```

#### Tenant Billing Integration
```javascript
// Subscription management per tenant
GET    /tenants/{id}/subscription
POST   /tenants/{id}/subscription/upgrade
POST   /tenants/{id}/subscription/cancel
GET    /tenants/{id}/invoices
POST   /tenants/{id}/payment-method
```

### Cross-Tenant Security

#### Preventie Maatregelen
- **Query injection protection**: Tenant_id altijd server-side toegevoegd
- **Cross-tenant request blocking**: Middleware checkt tenant context
- **Rate limiting per tenant**: Voorkom dat één tenant anderen beïnvloedt
- **Audit logging**: Alle cross-tenant attempts worden gelogd
- **Session isolation**: Aparte session stores per tenant

#### Security Headers
```javascript
// Elke response bevat security headers
{
  "X-Tenant-ID": "tenant_123",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-RateLimit-Tenant-Limit": "1000",
  "X-RateLimit-Tenant-Remaining": "456"
}
```

### Tenant Data Management

#### Backup & Restore per Tenant
```javascript
POST   /tenants/{id}/backup          // Maak backup
GET    /tenants/{id}/backups         // Lijst backups
POST   /tenants/{id}/restore         // Restore vanaf backup
```

#### Data Export (GDPR)
```javascript
POST   /tenants/{id}/export          // Export alle tenant data
DELETE /tenants/{id}/purge           // Volledige tenant verwijdering
```

#### Tenant Migration
```javascript
POST   /tenants/{id}/clone           // Kloon naar nieuwe tenant
POST   /tenants/{id}/merge           // Merge met andere tenant
POST   /tenants/{id}/transfer        // Transfer ownership
```

## Core CRM Modules

### 1. Property Management (Objectbeheer)

#### Data Model
- **Basis eigenschappen**: Adres, type, prijs, oppervlaktes, kamers, bouwjaar
- **Media assets**: Foto URLs, 360° tours, video links, plattegronden
- **Meta data**: Energielabel, WOZ waarde, VvE bijdrage, servicekosten
- **Locatie data**: GPS coördinaten, buurt statistieken, voorzieningen
- **Custom fields**: Unlimited custom eigenschappen per tenant

#### API Endpoints
```javascript
GET    /properties                 // Lijst met filters
GET    /properties/{id}           // Enkel object
POST   /properties                // Nieuw object
PUT    /properties/{id}           // Update object
DELETE /properties/{id}           // Verwijder object
GET    /properties/featured       // Uitgelichte objecten
GET    /properties/similar/{id}   // Vergelijkbare objecten
POST   /properties/bulk-import    // CSV/XML import
```

#### Status Management
- **Workflow states**: Concept → Actief → Onder bod → Verkocht → Afgehandeld
- **Automatische acties**: Status triggers voor emails, taken, notificaties
- **Historie logging**: Complete audit trail van alle wijzigingen

### 2. Contact Management (Relatiebeheer)

#### Koper Profiel
- **Basis data**: NAW gegevens, communicatie voorkeuren
- **Zoekopdracht**: Budget, type woning, locatie, must-haves
- **Interactie tracking**: Email opens, website gedrag, bezichtigingen
- **Lead scoring**: Automatische kwalificatie op 15+ factoren
- **Document vault**: Veilige opslag financiële documenten

#### Verkoper Profiel  
- **Property koppeling**: Relatie met objects in systeem
- **Verkoop journey**: Van waardering tot overdracht
- **Communicatie log**: Alle contactmomenten centraal
- **Performance metrics**: Kijkers, leads, bezichtigingen per object

#### API Endpoints
```javascript
GET    /contacts                  // Alle contacten
GET    /contacts/buyers           // Alleen kopers
GET    /contacts/sellers          // Alleen verkopers
POST   /contacts                  // Nieuwe contact (via website form)
GET    /contacts/{id}/matches     // Gematchte properties
POST   /contacts/{id}/documents   // Upload documenten
GET    /contacts/{id}/activity    // Activiteit historie
```

### 3. Lead Management & Automation

#### Lead Capture API
```javascript
POST   /leads/capture             // Universal lead endpoint
POST   /leads/property-inquiry    // Object specifieke lead
POST   /leads/valuation-request   // Waardebepaling aanvraag
POST   /leads/viewing-request     // Bezichtiging aanvraag
```

#### Lead Processing
- **Instant routing**: Direct naar juiste makelaar/team
- **Auto-responders**: Onmiddellijke bevestiging naar lead
- **Duplicate detection**: Voorkom dubbele entries
- **Source tracking**: Herkomst van elke lead (website, Funda, etc.)
- **Lead nurturing**: Geautomatiseerde follow-up sequences

#### Sales Pipeline
- **Kanban board**: Visuele pipeline in CRM interface
- **Stage automation**: Acties bij fase overgang
- **Conversion tracking**: Trechter analyse per bron
- **ROI measurement**: Waarde per lead source

### 4. Matching & AI Engine

#### Smart Matching
- **Real-time matching**: Nieuwe objecten → relevante kopers
- **Score algoritme**: 20+ variabelen (prijs, locatie, type, etc.)
- **Preference learning**: AI leert van koper gedrag
- **Alert system**: Push notificaties bij >85% match

#### API Endpoints
```javascript
GET    /matching/buyers-for-property/{id}  // Vind kopers voor object
GET    /matching/properties-for-buyer/{id}  // Vind objecten voor koper
POST   /matching/calculate                  // Bereken match score
GET    /matching/suggestions/{buyer_id}     // AI suggesties
```

### 5. Document & Contract Management

#### Document Hub
- **Centrale opslag**: Alle documenten per deal
- **Versie beheer**: Track wijzigingen in contracten
- **Templates**: Standaard documenten per tenant
- **E-signing ready**: Voorbereid voor DocuSign/Adobe Sign

#### API Endpoints
```javascript
GET    /documents/templates       // Beschikbare templates
POST   /documents/generate        // Genereer uit template
POST   /documents/upload          // Upload document
GET    /documents/deal/{id}       // Alle docs voor deal
POST   /documents/sign-request    // Initieer e-signing
```

### 6. Analytics & Reporting

#### Performance Metrics
- **Object analytics**: Views, clicks, conversion per object
- **Lead analytics**: Bronnen, conversie, response times
- **Team performance**: Productiviteit per makelaar
- **Financial metrics**: Omzet, commissies, pipeline waarde

#### API Endpoints
```javascript
GET    /analytics/properties/{id}     // Object statistieken
GET    /analytics/dashboard          // Hoofd KPIs
GET    /analytics/team               // Team performance
GET    /reports/generate            // Custom rapporten
```

## WordPress & Website Integraties

### WordPress Plugin Features
- **Shortcodes**: `[makelaar_properties]`, `[makelaar_search]`
- **Widgets**: Featured properties, recent properties, search box
- **Automatic sync**: Real-time updates via webhooks
- **SEO optimized**: Structured data, meta tags, sitemaps
- **Lead capture**: Forms direct naar CRM
- **Responsive**: Mobile-first design componenten

### Universal JavaScript Widget
```html
<!-- Embed in any website -->
<div id="makelaar-properties"></div>
<script src="https://cdn.makelaarcrm.nl/widget.js" 
        data-tenant="tenant-id"
        data-api-key="public-key">
</script>
```

### Webhook Events
```javascript
// Real-time updates naar makelaar websites
property.created
property.updated  
property.status_changed
property.price_changed
lead.received
viewing.scheduled
offer.received
```

### Platform Integraties
- **WordPress**: Native plugin met Gutenberg blocks
- **Webflow**: Copy-paste embed codes
- **Wix**: App marketplace integratie
- **Custom websites**: REST API + JavaScript SDK
- **Zapier**: 50+ triggers en acties
- **Make/Integromat**: Full API toegang

## Multi-Tenant Functionaliteit

### Tenant Hierarchie & Isolatie
```
Platform (SaaS Owner)
└── Tenant (Makelaarskantoor)
    ├── Users (Medewerkers)
    │   ├── Admin (Kantoor eigenaar)
    │   ├── Makelaar (Senior medewerker)
    │   ├── Assistant (Junior medewerker)
    │   └── Viewer (Alleen-lezen toegang)
    ├── Contacts (Klanten van deze tenant)
    │   ├── Buyers (Kopers)
    │   └── Sellers (Verkopers)
    ├── Properties (Objecten van deze tenant)
    ├── Documents (Bestanden van deze tenant)
    └── Settings (Tenant-specifieke configuratie)
```

### Tenant User Management

#### Rollen & Permissies per Tenant
```javascript
// Elke tenant definieert eigen rollen
TenantAdmin: {
  users: ['create', 'read', 'update', 'delete'],
  properties: ['create', 'read', 'update', 'delete'],
  contacts: ['create', 'read', 'update', 'delete'],
  settings: ['read', 'update'],
  billing: ['read', 'update'],
  api_keys: ['create', 'read', 'regenerate', 'delete']
}

Makelaar: {
  users: ['read'],
  properties: ['create', 'read', 'update'],
  contacts: ['create', 'read', 'update'],
  settings: ['read'],
  billing: [],
  api_keys: ['read']
}
- **KPI cards**: Actieve objecten, nieuwe leads, geplande bezichtigingen
- **Activity feed**: Real-time updates hele organisatie
- **Quick actions**: Nieuw object, nieuwe contact, taak aanmaken
- **Team calendar**: Gezamenlijke agenda view

### Property Management Interface
- **Grid/lijst view**: Met inline editing
- **Bulk operations**: Multi-select acties
- **Drag-drop upload**: Media bestanden
- **Portal syndication**: Publiceer naar Funda/Pararius
- **QR codes**: Per object voor marketing

### CRM Interface
- **360° klantview**: Complete historie per contact
- **Email integration**: Gmail/Outlook sync
- **Call logging**: Click-to-dial met automatische logs
- **Task management**: Follow-ups en reminders
- **Mobile app**: iOS/Android voor onderweg

### Settings & Configuration
- **Team management**: Gebruikers, rollen, rechten
- **API configuratie**: Keys, webhooks, rate limits
- **Workflow builder**: Visual automation designer
- **Email templates**: Drag-drop email builder
- **Branding**: Logo, kleuren, email signatures

## Platform Admin (SaaS Owner)

### Multi-Tenant Management Dashboard
- **Tenant overview**: Alle actieve tenants, status, plan
- **Growth metrics**: Nieuwe signups, churn, expansion
- **Resource usage**: Per tenant CPU, storage, API calls
- **Health monitoring**: Tenant activity, login frequency
- **Revenue dashboard**: MRR, ARR, LTV per tenant
- **Alert center**: Overlimit tenants, payment issues

### Tenant Lifecycle Management

#### Tenant Provisioning
- **Instant setup**: Automated schema creation
- **Template selection**: Starter/Pro/Enterprise templates
- **Demo data**: Optioneel met sample properties
- **Welcome sequence**: Automated onboarding emails
- **Training scheduler**: Boek training sessies

#### Tenant Monitoring
```javascript
GET /admin/tenants
{
  "tenants": [{
    "id": "tenant_123",
    "name": "Makelaar Jansen",
    "plan": "professional",
    "status": "active",
    "created": "2024-01-15",
    "metrics": {
      "users": 8,
      "properties": 145,
      "monthly_api_calls": 23456,
      "storage_gb": 12.3,
      "last_active": "2024-02-01T10:30:00Z"
    },
    "health_score": 85,
    "churn_risk": "low"
  }]
}
```

#### Tenant Support Tools
- **Impersonate user**: Login als tenant voor support
- **Tenant console**: Direct toegang tot tenant data
- **Debug mode**: Zie API calls en errors
- **Manual actions**: Reset password, unlock account
- **Communication**: In-app messaging naar tenant

### Subscription & Billing Management

#### Plan Management
- **Plan editor**: Wijzig features en limieten
- **Pricing rules**: Volume kortingen, promoties
- **Trial configuration**: Duur, features, conversie
- **Usage-based billing**: Overage charges setup
- **Payment processing**: Stripe/Mollie integratie

#### Billing Operations
```javascript
// Tenant billing acties
POST   /admin/tenants/{id}/change-plan
POST   /admin/tenants/{id}/add-credit
POST   /admin/tenants/{id}/waive-charges
GET    /admin/tenants/{id}/billing-history
POST   /admin/tenants/{id}/refund
```

### Platform Configuration

#### System-Wide Settings
- **Feature flags**: Enable/disable features globally
- **Maintenance mode**: Per tenant of platform-wide
- **Rate limits**: Global en per-plan limits
- **API versioning**: Deprecation notices
- **Security policies**: Password requirements, 2FA

#### Tenant Templates
- **Industry templates**: Residentieel, commercieel, nieuwbouw
- **Regional templates**: NL, BE, DE specifiek
- **Feature bundles**: Voorgedefinieerde combinaties
- **Onboarding flows**: Per template aangepast
- **Demo environments**: Probeer-zonder-creditcard

### Platform Monitoring

#### Infrastructure Metrics
- **Server health**: CPU, memory, disk per node
- **Database performance**: Query times, connections
- **API gateway**: Request/response times
- **Cache hit rates**: Redis performance
- **Queue processing**: Job success/failure rates

#### Business Intelligence
```javascript
GET /admin/analytics/dashboard
{
  "summary": {
    "total_tenants": 127,
    "active_tenants": 119,
    "total_users": 1847,
    "total_properties": 28439,
    "mrr": 42300,
    "arr": 507600
  },
  "growth": {
    "new_tenants_month": 12,
    "churn_rate": 2.1,
    "expansion_revenue": 3400,
    "nps_score": 72
  }
}
```

### Compliance & Security

#### GDPR Management
- **Data requests**: Export/delete per tenant
- **Consent tracking**: Per tenant, per user
- **Audit trails**: Complete activity logs
- **Data retention**: Automated cleanup policies
- **Privacy controls**: Anonymization tools

#### Security Operations
- **Threat monitoring**: Unusual activity detection
- **IP whitelisting**: Per tenant restrictions
- **API key rotation**: Force rotation schedule
- **Penetration testing**: Results en fixes
- **Incident response**: Playbooks en procedures

## Technische Specificaties

### Tech Stack
- **Backend**: Node.js/Next.js API routes
- **Database**: PostgreSQL met Row Level Security
- **Caching**: Redis voor API responses
- **File storage**: S3-compatible object storage
- **Search**: Elasticsearch voor property search
- **Queue**: Bull/Redis voor async jobs
- **Authentication**: JWT tokens, OAuth2 support

### API Standards
- **RESTful design**: Consistent resource URLs
- **Pagination**: Cursor-based voor performance
- **Filtering**: Advanced query parameters
- **Sorting**: Multi-field sorting support
- **Field selection**: GraphQL-style field picking
- **Rate limiting**: Per tenant, per endpoint
- **Versioning**: URL-based (/v1/, /v2/)

### Security & Compliance
- **Data isolation**: Tenant data strikte scheiding
- **Encryption**: TLS 1.3, AES-256 at rest
- **GDPR compliant**: Data portability, right to delete
- **API security**: Rate limiting, DDoS protection
- **Audit logging**: Alle API calls gelogd
- **Backup**: Hourly snapshots, 30-day retention

## Implementatie Roadmap

### Fase 1: Foundation (6-8 weken)
- ✅ Multi-tenant database structuur
- ✅ Basis property CRUD API
- ✅ Contact management API  
- ✅ Authentication systeem
- ✅ Simpel admin dashboard

### Fase 2: Core Features (8-10 weken)
- ✅ Lead capture & routing
- ✅ Matching engine v1
- ✅ WordPress plugin basis
- ✅ Email automations
- ✅ Document management

### Fase 3: Advanced (10-12 weken)
- ✅ AI-powered matching
- ✅ Geavanceerde analytics
- ✅ Workflow automation
- ✅ Mobile apps
- ✅ Zapier integratie

### Fase 4: Scale (Ongoing)
- ✅ Performance optimalisatie
- ✅ Enterprise features
- ✅ Internationale expansie
- ✅ Predictive analytics
- ✅ Voice AI assistant

## Unieke Selling Points

1. **Geen website lock-in**: Makelaars houden eigen site
2. **Instant integratie**: WordPress plugin, 5 minuten setup
3. **Real-time sync**: Wijzigingen direct zichtbaar op website
4. **AI matching**: Slimmer dan traditionele CRM systemen
5. **API-first**: Integreer met elk systeem
6. **Multi-portal**: Publiceer naar alle portals vanuit één systeem
7. **White-label ready**: Volledig te branden als eigen product

## Success Metrics
- API uptime: 99.99%
- API response time: <100ms (cached), <500ms (uncached)
- Tenant churn: <3% per jaar
- Feature adoption: 80% gebruikt matching engine
- Lead conversion: 25% verbetering na 6 maanden
- Time-to-value: Eerste lead binnen 24 uur