import { WeatherData, ForecastData } from '@/app/types/weather';

const API_KEY = process.env.WEATHER_API_KEY;

if (!API_KEY) {
  throw new Error('WEATHER_API_KEY environment variable is not set');
}

export const fetchWeatherData = async (city: string): Promise<WeatherData> => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
    { next: { revalidate: 900 } }
  );

  if (!response.ok) {
    throw new Error('City not found');
  }

  return response.json();
};

export const fetchForecastData = async (city: string): Promise<ForecastData> => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`,
    { next: { revalidate: 900 } }
  );

  if (!response.ok) {
    throw new Error('Forecast not found');
  }

  return response.json();
};