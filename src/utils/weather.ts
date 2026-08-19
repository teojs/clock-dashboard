import type { WeatherInfo } from '../types'
import { i18n } from '../i18n'

/**
 * 将 WMO 天气代码映射为 Meteocons (Bas Milius 版) 图标名称
 * CDN: https://basmilius.github.io/weather-icons/
 */
export function mapWmoCode(code: number, isDay: boolean = true): WeatherInfo {
  const getIconName = () => {
    if (code === -1) return 'not-available'

    // WMO 0: 晴朗
    if (code === 0) return isDay ? 'clear-day' : 'clear-night'

    // WMO 1-2: 晴间多云 / 多云
    if (code === 1 || code === 2) return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night'

    // WMO 3: 阴
    if (code === 3) return 'overcast'

    // WMO 45, 48: 雾
    if (code === 45 || code === 48) return isDay ? 'fog-day' : 'fog-night'

    // WMO 51, 53, 55: 毛毛雨
    if (code >= 51 && code <= 55) return 'drizzle'

    // WMO 61, 63, 65: 雨
    if (code >= 61 && code <= 65) return 'rain'

    // WMO 66, 67: 冻雨
    if (code === 66 || code === 67) return 'sleet'

    // WMO 71-77: 雪
    if (code >= 71 && code <= 77) return 'snow'

    // WMO 80-82: 阵雨
    if (code >= 80 && code <= 82) return isDay ? 'partly-cloudy-day-rain' : 'partly-cloudy-night-rain'

    // WMO 85-86: 阵雪
    if (code === 85 || code === 86) return isDay ? 'partly-cloudy-day-snow' : 'partly-cloudy-night-snow'

    // WMO 95-99: 雷阵雨
    if (code >= 95) return isDay ? 'thunderstorms-day-rain' : 'thunderstorms-night-rain'

    return isDay ? 'clear-day' : 'clear-night'
  }

  const icon = `./weather-icons/${getIconName()}.svg`

  const { t, te } = i18n.global
  const conditionKey = `weather.conditions.${code}`
  const conditionText = te(conditionKey) ? t(conditionKey) : t('weather.conditions.unknown')

  return {
    text: conditionText,
    icon,
  }
}

/** 将和风天气 icon 代码映射为 WMO 天气代码，便于复用现有图标与特效逻辑 */
export function mapQweatherIconToWmo(icon: string | number): number {
  const code = Number(icon)
  if (Number.isNaN(code)) return -1

  if (code === 100 || code === 150) return 0
  if (code === 102 || code === 152) return 1
  if (code === 101 || code === 103 || code === 151 || code === 153) return 2
  if (code === 104 || code === 154) return 3

  if (code === 309) return 51
  if (code === 300 || code === 350) return 80
  if (code === 301 || code === 351) return 82
  if (code === 302 || code === 303) return 95
  if (code === 304) return 96
  if (code === 305 || code === 314 || code === 399) return 61
  if (code === 306 || code === 315) return 63
  if (code === 313) return 66
  if (code === 307 || code === 308 || (code >= 310 && code <= 312) || (code >= 316 && code <= 318)) return 65

  if (code === 400 || code === 408 || code === 499) return 71
  if (code === 401 || code === 409) return 73
  if (code === 402 || code === 403 || code === 410) return 75
  if (code === 404 || code === 405 || code === 406 || code === 456) return 66
  if (code === 407 || code === 457) return 85

  if (code >= 500 && code <= 515) return 45

  if (code === 900 || code === 901) return 0
  return -1
}

export function getAqiInfo(aqi: number | undefined) {
  const { t } = i18n.global
  if (aqi === undefined) return { label: '--', color: 'text-white/40' }

  if (aqi <= 50) return { label: t('weather.aqi.good'), color: 'text-green-400' }
  if (aqi <= 100) return { label: t('weather.aqi.moderate'), color: 'text-yellow-400' }
  if (aqi <= 150) return { label: t('weather.aqi.light'), color: 'text-orange-400' }
  if (aqi <= 200) return { label: t('weather.aqi.medium'), color: 'text-red-400' }
  if (aqi <= 300) return { label: t('weather.aqi.heavy'), color: 'text-purple-400' }
  return { label: t('weather.aqi.severe'), color: 'text-red-900' }
}
