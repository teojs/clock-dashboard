export interface WeatherApiResponse {
  current: {
    temperature_2m: number
    rain: number
    wind_speed_10m: number
    is_day: number
    apparent_temperature: number
    showers: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
  }
  hourly: {
    precipitation_probability: number[]
    uv_index: number[]
    temperature_2m: number[]
  }
  current_hour_index?: number
}

export interface NominatimSearchResult {
  name: string
  display_name: string
  lat: string
  lon: string
}

export interface BigDataCloudLocationResponse {
  city?: string
  locality?: string
  principalSubdivision?: string
  latitude?: number
  longitude?: number
}

export interface CitySearchResult {
  name: string
  displayName: string
  latitude: number
  longitude: number
}

export interface HAEntityState {
  entity_id: string
  state: string
  attributes: Record<string, any>
  last_changed: string
  last_updated: string
}

export interface HAServiceCallParams {
  entity_id: string
  [key: string]: any
}

export interface Coordinates {
  latitude: number
  longitude: number
}
