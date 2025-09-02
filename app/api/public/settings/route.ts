import { NextResponse } from 'next/server'
import { SettingsService } from '@/lib/services/settings.service'

// GET /api/public/settings - Get public platform settings (no auth required)
export async function GET() {
  try {
    const publicSettings = await SettingsService.getPublicSettings()
    
    return NextResponse.json({
      success: true,
      data: publicSettings
    })
  } catch (error) {
    console.error('Error fetching public settings:', error)
    
    // Fallback to defaults if database fails
    return NextResponse.json({
      success: true,
      data: {
        'company.name': 'Makelaar CRM Professional',
        'company.description': 'Professionele CRM voor internationale makelaardij',
        'company.phone': '+31 20 800 1234',
        'company.email': 'info@makelaarcrm.nl',
        'homepage.hero_title': 'Complete CRM voor Internationale Makelaardij',
        'homepage.hero_subtitle': 'Specialist platform voor Nederlandse, Engelse en Belgische makelaars die actief zijn in Spanje',
        'homepage.cta_text': 'Start 14 Dagen Gratis'
      }
    })
  }
}