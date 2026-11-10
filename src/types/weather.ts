export interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: Array<number | null>;
  };
}

// Object yang digunakan aplikasi setelah data JSON dari API diproses.
export interface WeatherInfo {
  location: string;
  updatedAt: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  maxTemperature: number;
  minTemperature: number;
  rainProbability: number;
  condition: string;
  icon: string;
}
