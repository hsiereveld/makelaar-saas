import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  // Mock data for now - replace with database calls
  const properties = [
    {
      id: '1',
      title: 'Modern Apartment Amsterdam',
      price: 450000,
      bedrooms: 2,
      city: 'Amsterdam',
    },
    {
      id: '2', 
      title: 'Family House Utrecht',
      price: 650000,
      bedrooms: 4,
      city: 'Utrecht',
    },
  ];

  const resolvedParams = await params;
  
  return NextResponse.json({
    success: true,
    data: properties,
    tenant: resolvedParams.tenant,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const data = await request.json();
  
  return NextResponse.json({
    success: true,
    message: 'Property created',
    data: { ...data, id: Math.random().toString() },
  }, { status: 201 });
}
