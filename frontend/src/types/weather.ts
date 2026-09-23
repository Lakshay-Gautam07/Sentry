export interface WeatherCondition {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  weatherCode: number;
  condition: string;
  emoji: string;
  windSpeed: number;
  windDirection: string;
  windDegrees: number;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  weatherCode: number;
  condition: string;
  emoji: string;
  precipitationProbability: number;
}

export interface DailyWeather {
  date: string;
  weatherCode: number;
  condition: string;
  emoji: string;
  tempMax: number;
  tempMin: number;
  sunrise: string;
  sunset: string;
  precipitationProbabilityMax: number;
}

export interface WeatherData {
  timezone: string;
  timezoneAbbreviation: string;
  elevation: number;
  current: WeatherCondition;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export interface WeatherResponse {
  success: boolean;
  latitude: number;
  longitude: number;
  weather: WeatherData;
  message?: string;
}
