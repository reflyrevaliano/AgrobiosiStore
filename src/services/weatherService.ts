import { OpenMeteoResponse, WeatherInfo } from '../types/weather';

// Endpoint API eksternal Open-Meteo. API ini dapat digunakan tanpa API key.
// Koordinat default mengarah ke Kota Malang dan dapat diganti sesuai kebutuhan demo.
const WEATHER_API_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=-7.9666&longitude=112.6326&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=1&timezone=Asia%2FJakarta';

function describeWeather(code: number): { condition: string; icon: string } {
  if (code === 0) return { condition: 'Cerah', icon: '☀️' };
  if (code === 1) return { condition: 'Cerah berawan', icon: '🌤️' };
  if (code === 2) return { condition: 'Berawan sebagian', icon: '⛅' };
  if (code === 3) return { condition: 'Berawan', icon: '☁️' };
  if (code === 45 || code === 48) return { condition: 'Berkabut', icon: '🌫️' };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'Gerimis', icon: '🌦️' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { condition: 'Hujan', icon: '🌧️' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'Salju', icon: '❄️' };
  if ([95, 96, 99].includes(code)) return { condition: 'Badai petir', icon: '⛈️' };
  return { condition: 'Kondisi cuaca bervariasi', icon: '🌥️' };
}

// Custom async function: mengambil data API dan mengubah JSON menjadi Object WeatherInfo.
export async function getWeatherFromApi(): Promise<WeatherInfo> {
  // fetch() adalah pre-built asynchronous function yang tersedia di JavaScript/React Native.
  const response = await fetch(WEATHER_API_URL);

  if (!response.ok) {
    throw new Error(`Permintaan API gagal (HTTP ${response.status}).`);
  }

  const data = (await response.json()) as OpenMeteoResponse;

  // Pemeriksaan sederhana agar aplikasi tidak memproses respons yang tidak lengkap.
  if (!data.current || !data.daily || !data.daily.time?.length) {
    throw new Error('Format data cuaca dari server tidak sesuai.');
  }

  const description = describeWeather(data.current.weather_code);

  // Data JSON dimasukkan ke Object yang strukturnya ditentukan oleh Interface WeatherInfo.
  const weatherObject: WeatherInfo = {
    location: 'Malang',
    updatedAt: data.current.time,
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    precipitation: data.current.precipitation,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
    maxTemperature: data.daily.temperature_2m_max[0] ?? 0,
    minTemperature: data.daily.temperature_2m_min[0] ?? 0,
    rainProbability: data.daily.precipitation_probability_max[0] ?? 0,
    condition: description.condition,
    icon: description.icon,
  };

  return weatherObject;
}

// Custom Promise: memperlihatkan penggunaan resolve(), reject(), dan .then().
export function getWeatherWithPromise(): Promise<WeatherInfo> {
  return new Promise<WeatherInfo>((resolve, reject) => {
    getWeatherFromApi()
      .then((weatherObject) => {
        // resolve() dipanggil ketika proses mengambil dan mengolah data berhasil.
        resolve(weatherObject);
      })
      .catch((error: unknown) => {
        // reject() dipanggil ketika proses API gagal.
        reject(error);
      });
  });
}
