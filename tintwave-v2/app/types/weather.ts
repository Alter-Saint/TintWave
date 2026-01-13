export interface WeatherData {
  main: {
    temp: number;
  };
  weather: {
    icon: string;
    description: string;
  }[];
}
export interface ForecastData {
  list: {
    dt: number;
    main: {
      temp: number;
    };
    weather: {
      description: string;
      icon: string;
    }[];
  }[];
}