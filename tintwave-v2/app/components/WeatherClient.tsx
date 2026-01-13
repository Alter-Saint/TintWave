'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { WeatherData, ForecastData } from '@/app/types/weather';
import { ThemeToggle } from '@/app/components/theme-toggle';

export default function WeatherClient() {
  const [city, setCity] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFetchWeather = async (params: { cityName?: string; lat?: number; lon?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: params.cityName,
          lat: params.lat,
          lon: params.lon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }

      const data = await response.json();
      setWeatherData(data.weather);
      setForecastData(data.forecast);
      
      if (data.weather?.name && !params.cityName) {
        setCity(data.weather.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setWeatherData(null);
      setForecastData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleFetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setError("Please enter a city manually.")
      );
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return setError('Please enter a city name');
    handleFetchWeather({ cityName: city });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric' 
    });
  };

  const getDailyForecasts = () => {
    if (!forecastData?.list) return [];
    const dailyData = [];
    const processedDates = new Set();
    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000).toDateString();
      if (!processedDates.has(date) && dailyData.length < 5) {
        dailyData.push(item);
        processedDates.add(date);
      }
    }
    return dailyData;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">TintWave</h1>
          <ThemeToggle />
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50">
            {loading ? '...' : 'Get Weather'}
          </button>
        </form>
      </header>

      <main className="container mx-auto px-4 pb-8">
        {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4">{error}</div>}
        {weatherData && (
          <div className="space-y-6">
            <section className="bg-card text-card-foreground rounded-lg border p-6">
              <h2 className="text-2xl font-semibold mb-4">Current Weather</h2>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-5xl font-bold">{Math.round(weatherData.main.temp)}°C</p>
                  <p className="text-muted-foreground capitalize">{weatherData.weather[0].description}</p>
                </div>
                <Image src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} alt="icon" width={100} height={100} />
              </div>
            </section>
            <section className="bg-card text-card-foreground rounded-lg border p-6">
              <h2 className="text-2xl font-semibold mb-4">5-day Forecast</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {getDailyForecasts().map((f, i) => (
                  <div key={i} className="text-center p-4 rounded-md bg-secondary">
                    <h3 className="font-medium mb-2">{formatDate(f.dt)}</h3>
                    <Image src={`https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png`} alt="icon" width={80} height={80} className="mx-auto" />
                    <p className="text-sm text-muted-foreground capitalize">{f.weather[0].description}</p>
                    <p className="text-2xl font-bold mt-2">{Math.round(f.main.temp)}°C</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}