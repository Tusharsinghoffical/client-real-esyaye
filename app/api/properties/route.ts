import { NextRequest, NextResponse } from 'next/server';
import { getProperties, createProperty } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const listingType = searchParams.get('listingType') as 'buy' | 'rent' | null || undefined;
    const category = searchParams.get('category') || undefined;
    const propertyType = searchParams.get('propertyType') || undefined;
    const city = searchParams.get('city') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const bedrooms = searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined;
    const searchQuery = searchParams.get('q') || undefined;
    const onlyFeatured = searchParams.get('featured') === 'true';

    const properties = getProperties({
      listingType,
      category,
      propertyType,
      city,
      minPrice,
      maxPrice,
      bedrooms,
      searchQuery,
      onlyFeatured
    });

    return NextResponse.json({ success: true, count: properties.length, properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.title || !body.price || !body.location?.city) {
      return NextResponse.json({ success: false, error: 'Title, price, and city are required' }, { status: 400 });
    }

    const created = createProperty(body);
    return NextResponse.json({ success: true, property: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ success: false, error: 'Failed to create property' }, { status: 500 });
  }
}
