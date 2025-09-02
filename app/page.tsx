import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, Shield, TrendingUp, ArrowRight, CheckCircle, Globe2, Building } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Professional Nederlandse Header */}
      <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container-business">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Building2 className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <span className="text-xl font-semibold text-neutral-900">Casa CRM</span>
                <div className="text-sm text-neutral-500 font-medium">Professional Real Estate Platform</div>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/auth/login" className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors">
                Inloggen
              </Link>
              <Link href="/auth/register">
                <Button variant="business" size="default">
                  Gratis Proberen
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Professional Nederlandse Hero Section */}
      <main className="section-business">
        <div className="container-business">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Shield className="h-4 w-4" />
              Professionele Multi-Tenant CRM Platform
            </div>
            
            <h1 className="text-business-title text-5xl md:text-6xl mb-6">
              Complete CRM voor <br />
              <span className="text-primary-600">Internationale Makelaardij</span>
            </h1>
            
            <p className="text-business-subtitle max-w-3xl mx-auto mb-12">
              Specialist platform voor Nederlandse, Engelse en Belgische makelaars die actief zijn in Spanje. 
              Beheer panden, contacten en transacties met professionele interfaces voor alle partijen.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <Link href="/auth/register">
                <Button variant="business" size="xl">
                  Start 14 Dagen Gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Bestaande Gebruiker
                </Button>
              </Link>
            </div>
            
            {/* Nederlandse Business Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success-500" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success-500" />
                <span>Multi-Tenant Beveiliging</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success-500" />
                <span>Nederlandse Hosting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success-500" />
                <span>24/7 Ondersteuning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nederlandse Business Feature Section */}
        <section className="section-business bg-neutral-50">
          <div className="container-business">
            <div className="text-center mb-16">
              <h2 className="text-business-title mb-4">
                Alles wat je nodig hebt voor professionele makelaardij
              </h2>
              <p className="text-business-body max-w-2xl mx-auto">
                Van pandbeheer tot klantrelaties - één platform voor al je zakelijke processen
              </p>
            </div>
            
            <div className="grid-business-cards">
              <Card variant="business" elevation="medium">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-primary-50 rounded-lg">
                      <Building2 className="h-6 w-6 text-primary-600" />
                    </div>
                    <CardTitle>Pand Management</CardTitle>
                  </div>
                  <CardDescription>
                    Complete levenscyclus van panden met Nederlandse workflow processen, 
                    statusbeheer en geautomatiseerde notificaties voor alle betrokkenen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-neutral-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Volledige pand CRUD met workflow validatie</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Status overgangen (concept → actief → verkocht)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Contact-pand relatie tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Geautomatiseerde workflow triggers</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card variant="business" elevation="medium">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-success-50 rounded-lg">
                      <Users className="h-6 w-6 text-success-600" />
                    </div>
                    <CardTitle>Contact & Lead Beheer</CardTitle>
                  </div>
                  <CardDescription>
                    Uitgebreid contactbeheer met Nederlandse business patronen voor 
                    kopers, verkopers en internationale klantrelaties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-neutral-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Contact CRUD voor kopers/verkopers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Lead capture met bron tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Geautomatiseerde lead scoring</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Bulk import/export functionaliteit</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card variant="business" elevation="medium">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-warning-50 rounded-lg">
                      <Globe2 className="h-6 w-6 text-warning-600" />
                    </div>
                    <CardTitle>Internationale Architectuur</CardTitle>
                  </div>
                  <CardDescription>
                    Complete tenant isolatie met aangepaste branding, 
                    functie beheer en rol-gebaseerde toegangscontrole
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-neutral-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Volledig authenticatiesysteem</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Rol-gebaseerde permissies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Aangepaste tenant branding</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success-500 shrink-0" />
                      <span>Feature flag management</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Nederlandse Business CTA Section */}
        <section className="section-business">
          <div className="container-business">
            <Card variant="executive" elevation="prominent" className="overflow-hidden">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-12 text-center">
                <h2 className="text-business-title mb-4">
                  Klaar om je Makelaarspraktijk te Moderniseren?
                </h2>
                <p className="text-business-subtitle mb-12 max-w-2xl mx-auto">
                  Sluit je aan bij honderden makelaars die hun internationale vastgoedtransacties 
                  beheren met onze professionele CRM platform
                </p>
                
                {/* Nederlandse Business Metrics */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg border border-white/50">
                    <div className="text-4xl font-bold text-primary-700 mb-2">320+</div>
                    <div className="text-business-caption">Uitgebreide Tests</div>
                    <div className="text-xs text-neutral-500 mt-1">Kwaliteit Gegarandeerd</div>
                  </div>
                  <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg border border-white/50">
                    <div className="text-4xl font-bold text-success-600 mb-2">25+</div>
                    <div className="text-business-caption">API Eindpunten</div>
                    <div className="text-xs text-neutral-500 mt-1">Volledige Integratie</div>
                  </div>
                  <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg border border-white/50">
                    <div className="text-4xl font-bold text-warning-600 mb-2">100%</div>
                    <div className="text-business-caption">Tenant Isolatie</div>
                    <div className="text-xs text-neutral-500 mt-1">Veilig & Betrouwbaar</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Link href="/auth/register">
                    <Button variant="business" size="xl">
                      Start 14 Dagen Gratis
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button variant="outline" size="lg">
                      Demo Bekijken
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      {/* Professional Nederlandse Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="container-business">
          <div className="py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-neutral-900">Casa CRM</span>
                    <div className="text-sm text-neutral-500">Professional Real Estate Platform</div>
                  </div>
                </div>
                <p className="text-business-body max-w-md">
                  De professionele CRM oplossing voor Nederlandse, Engelse en Belgische 
                  makelaars die actief zijn in de Spaanse vastgoedmarkt.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Platform</h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li><Link href="/auth/register" className="hover:text-primary-600">Gratis Proberen</Link></li>
                  <li><Link href="/auth/login" className="hover:text-primary-600">Inloggen</Link></li>
                  <li><Link href="/platform-admin" className="hover:text-primary-600">Platform Admin</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Ondersteuning</h3>
                <ul className="space-y-2 text-sm text-neutral-600">
                  <li><a href="mailto:support@makelaarcrm.nl" className="hover:text-primary-600">support@makelaarcrm.nl</a></li>
                  <li><a href="tel:+31208001234" className="hover:text-primary-600">+31 20 800 1234</a></li>
                  <li className="text-xs text-neutral-500 mt-2">Nederlandse Ondersteuning</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-neutral-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-neutral-500">
                © 2025 Casa CRM. Professioneel multi-tenant vastgoed management platform.
              </p>
              <div className="flex items-center gap-6 text-sm text-neutral-500">
                <span>Privacy Beleid</span>
                <span>Algemene Voorwaarden</span>
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
