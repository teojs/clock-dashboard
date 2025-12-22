export interface HAConfig {
  url: string;
  token: string;
  entities: HAEntity[];
}

export interface HAEntity {
  id: string;
  name: string;
}

export interface WeatherInfo {
  text: string;
  type: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'storm';
}

export interface LunarInfo {
  fullDate: string;
  month: string;
  date: string;
  year: string;
}
