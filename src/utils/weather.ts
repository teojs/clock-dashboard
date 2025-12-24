import type { WeatherInfo } from '../types'

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

  const textMap: Record<number, string> = {
    0: '晴朗',
    1: '晴间多云',
    2: '多云',
    3: '阴',
    45: '雾',
    48: '沉积雾',
    51: '小毛毛雨',
    53: '毛毛雨',
    55: '大毛毛雨',
    56: '轻微冻毛毛雨',
    57: '冻毛毛雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '轻微冻雨',
    67: '冻雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '雪粒',
    80: '小阵雨',
    81: '阵雨',
    82: '强阵雨',
    85: '小阵雪',
    86: '阵雪',
    95: '雷阵雨',
    96: '雷雨伴有冰雹',
    99: '强雷雨伴冰雹',
  }

  return {
    text: textMap[code] || '未知',
    icon,
  }
}
