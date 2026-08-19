import type { AirQualityApiResponse, WeatherApiResponse } from './types'
import { mapQweatherIconToWmo } from '../utils/weather'

const DEFAULT_QWEATHER_HOST = 'https://devapi.qweather.com'

interface QweatherNowResponse {
  code: string
  now?: {
    obsTime: string
    temp: string
    feelsLike: string
    icon: string
    text: string
    windSpeed: string
    humidity: string
    precip: string
  }
}

interface QweatherDailyResponse {
  code: string
  daily?: Array<{
    fxDate: string
    sunrise: string
    sunset: string
    tempMax: string
    tempMin: string
    iconDay: string
    precip: string
    uvIndex: string
  }>
}

interface QweatherHourlyResponse {
  code: string
  hourly?: Array<{
    fxTime: string
    temp: string
    icon: string
    pop: string
    precip: string
  }>
}

interface QweatherAirResponse {
  code: string
  now?: {
    aqi: string
  }
}

export interface QweatherFetchOptions {
  key: string
  host?: string
  lang?: string
}

function normalizeHost(host?: string): string {
  const trimmed = (host || '').trim().replace(/\/+$/, '')
  if (!trimmed) return DEFAULT_QWEATHER_HOST
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function toQweatherLang(locale?: string): string {
  if (!locale) return 'zh'
  if (locale.startsWith('zh-TW') || locale.startsWith('zh-HK')) return 'zh-hant'
  if (locale.startsWith('zh')) return 'zh'
  if (locale.startsWith('en')) return 'en'
  return locale.split('-')[0]
}

function assertQweatherOk(code: string, path: string) {
  if (code === '200') return
  if (code === '401' || code === '403') throw new Error('QWeather API key invalid')
  if (code === '402') throw new Error('QWeather API quota exceeded')
  if (code === '429') throw new Error('QWeather API rate limited')
  throw new Error(`QWeather API error (${path}): ${code}`)
}

async function qweatherGet<T extends { code: string }>(
  path: string,
  options: QweatherFetchOptions,
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(path, `${normalizeHost(options.host)}/`)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })
  url.searchParams.set('key', options.key)
  url.searchParams.set('lang', toQweatherLang(options.lang))

  const response = await fetch(url.toString(), {
    headers: {
      'X-QW-Api-Key': options.key,
      'Accept': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`QWeather API error: ${response.statusText}`)
  }

  const data = await response.json() as T
  assertQweatherOk(data.code, path)
  return data
}

function parseHour(isoTime: string): number {
  const date = new Date(isoTime)
  return Number.isNaN(date.getTime()) ? 0 : date.getHours()
}

function isDaytime(sunrise?: string, sunset?: string, now = new Date()): boolean {
  if (!sunrise || !sunset) return now.getHours() >= 6 && now.getHours() < 18
  const [riseH, riseM] = sunrise.split(':').map(Number)
  const [setH, setM] = sunset.split(':').map(Number)
  const minutes = now.getHours() * 60 + now.getMinutes()
  return minutes >= riseH * 60 + riseM && minutes < setH * 60 + setM
}

function toLocation(lat: number, lon: number): string {
  return `${lon.toFixed(2)},${lat.toFixed(2)}`
}

export async function fetchQweatherWeatherData(
  lat: number,
  lon: number,
  options: QweatherFetchOptions,
): Promise<WeatherApiResponse> {
  const location = toLocation(lat, lon)
  const [nowRes, dailyRes, hourlyRes] = await Promise.all([
    qweatherGet<QweatherNowResponse>('/v7/weather/now', options, { location }),
    qweatherGet<QweatherDailyResponse>('/v7/weather/7d', options, { location }),
    qweatherGet<QweatherHourlyResponse>('/v7/weather/24h', options, { location }),
  ])

  const now = nowRes.now
  const dailyList = dailyRes.daily || []
  const hourlyList = hourlyRes.hourly || []
  if (!now) throw new Error('QWeather API error: empty now data')

  const precipitationProbability = Array.from({ length: 24 }, () => 0)
  const uvIndex = Array.from({ length: 24 }, () => Number(dailyList[0]?.uvIndex || 0))
  const hourlyTemp = Array.from({ length: 24 }, () => Number(now.temp))

  hourlyList.forEach((item) => {
    const hour = parseHour(item.fxTime)
    precipitationProbability[hour] = Number(item.pop || 0)
    hourlyTemp[hour] = Number(item.temp)
  })

  const precipitationByDate: Record<string, number[]> = {}
  hourlyList.forEach((item) => {
    const dateKey = item.fxTime.slice(0, 10)
    if (!precipitationByDate[dateKey]) precipitationByDate[dateKey] = []
    precipitationByDate[dateKey].push(Number(item.pop || 0))
  })

  const currentHour = new Date().getHours()
  const today = dailyList[0]

  return {
    current: {
      temperature_2m: Number(now.temp),
      rain: Number(now.precip),
      wind_speed_10m: Number(now.windSpeed),
      is_day: isDaytime(today?.sunrise, today?.sunset) ? 1 : 0,
      apparent_temperature: Number(now.feelsLike),
      showers: Number(now.precip),
      relative_humidity_2m: Number(now.humidity),
      precipitation: Number(now.precip),
      weather_code: mapQweatherIconToWmo(now.icon),
    },
    hourly: {
      precipitation_probability: precipitationProbability,
      uv_index: uvIndex,
      temperature_2m: hourlyTemp,
    },
    daily: {
      time: dailyList.slice(0, 5).map(day => day.fxDate),
      weather_code: dailyList.slice(0, 5).map(day => mapQweatherIconToWmo(day.iconDay)),
      temperature_2m_max: dailyList.slice(0, 5).map(day => Number(day.tempMax)),
      temperature_2m_min: dailyList.slice(0, 5).map(day => Number(day.tempMin)),
      precipitation_probability_max: dailyList.slice(0, 5).map((day) => {
        const pops = precipitationByDate[day.fxDate]
        if (pops?.length) return Math.max(...pops)
        return Number(day.precip) > 0 ? 60 : 0
      }),
    },
    current_hour_index: currentHour,
  }
}

export async function fetchQweatherAirQualityData(
  lat: number,
  lon: number,
  options: QweatherFetchOptions,
): Promise<AirQualityApiResponse> {
  const data = await qweatherGet<QweatherAirResponse>('/v7/air/now', options, {
    location: toLocation(lat, lon),
  })
  return {
    current: {
      us_aqi: Number(data.now?.aqi || 0),
    },
  }
}
