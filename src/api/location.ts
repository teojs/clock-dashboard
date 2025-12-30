import type { BigDataCloudLocationResponse, Coordinates } from './types'

export async function reverseGeocode(lat: number, lon: number): Promise<BigDataCloudLocationResponse> {
  const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`)

  if (!response.ok) {
    throw new Error(`Reverse geocoding API error: ${response.statusText}`)
  }

  const data = await response.json() as BigDataCloudLocationResponse
  return data
}

export async function getLocationByIp(): Promise<BigDataCloudLocationResponse> {
  const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=zh')

  if (!res.ok) {
    throw new Error(`IP location API error: ${res.statusText}`)
  }

  const data = await res.json() as BigDataCloudLocationResponse
  return data
}

export async function getCurrentPosition(timeout: number = 5000): Promise<Coordinates> {
  if (!navigator.geolocation) {
    const ipLocation = await getLocationByIp()
    if (ipLocation.latitude && ipLocation.longitude) {
      return {
        latitude: ipLocation.latitude,
        longitude: ipLocation.longitude,
      }
    }
    throw new Error('Geolocation is not supported and IP location failed')
  }

  try {
    return await new Promise<Coordinates>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        { timeout },
      )
    })
  }
  catch (error) {
    const ipLocation = await getLocationByIp()
    if (ipLocation.latitude && ipLocation.longitude) {
      return {
        latitude: ipLocation.latitude,
        longitude: ipLocation.longitude,
      }
    }
    throw new Error('Geolocation failed and IP location failed')
  }
}
