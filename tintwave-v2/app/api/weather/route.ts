import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    const { city, lat, lon } = await request.json();

    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.WEATHER_API_KEY}&units=metric`;
    let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?appid=${process.env.WEATHER_API_KEY}&units=metric`;

    if (city) {
      weatherUrl += `&q=${city}`;
      forecastUrl += `&q=${city}`;
    } else if (lat && lon) {
      weatherUrl += `&lat=${lat}&lon=${lon}`;
      forecastUrl += `&lat=${lat}&lon=${lon}`;
    } else {
      return NextResponse.json({ error: 'City or coordinates required' }, { status: 400 });
    }

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(weatherUrl, { next: { revalidate: 900 } }),
      fetch(forecastUrl, { next: { revalidate: 900 } })
    ]);

    const weather = await weatherRes.json();
    const forecast = await forecastRes.json();

    return NextResponse.json({ weather, forecast });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
     return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}