# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.21.2](https://github.com/teojs/clock-dashboard/compare/v1.21.1...v1.21.2) (2026-08-20)

### [1.21.1](https://github.com/teojs/clock-dashboard/compare/v1.21.0...v1.21.1) (2026-08-20)

## [1.21.0](https://github.com/teojs/clock-dashboard/compare/v1.20.4...v1.21.0) (2026-08-19)


### Features

* add compact clock mode with adjustable settings and new font integration ([048d20e](https://github.com/teojs/clock-dashboard/commit/048d20e74107bc658d80753fdebc33faa35660c9))
* add QWeather support for enhanced weather data and air quality ([dbc3322](https://github.com/teojs/clock-dashboard/commit/dbc33223bcf0807eecdb070b30f5b7acc9c98629))

### [1.20.4](https://github.com/teojs/clock-dashboard/compare/v1.20.3...v1.20.4) (2026-06-05)


### Bug Fixes

* ensure correct date parsing in WeatherForecastModal for daily forecasts ([a75a6ad](https://github.com/teojs/clock-dashboard/commit/a75a6ad085679d98e07c4a16a752ba9c5207832a))

### [1.20.3](https://github.com/teojs/clock-dashboard/compare/v1.20.2...v1.20.3) (2026-03-26)

### [1.20.2](https://github.com/teojs/clock-dashboard/compare/v1.20.1...v1.20.2) (2026-03-25)


### Features

* implement idle detection in WeatherForecastModal to automatically close the modal after 30 seconds of inactivity ([a43265e](https://github.com/teojs/clock-dashboard/commit/a43265e4a602b5ff12e253b36466d0173d185089))

### [1.20.1](https://github.com/teojs/clock-dashboard/compare/v1.20.0...v1.20.1) (2026-01-21)

## [1.20.0](https://github.com/teojs/clock-dashboard/compare/v1.19.1...v1.20.0) (2026-01-21)


### Features

* add layout configuration options and clock-only mode toggle in GeneralSettings, enhance localization for layout settings, and update ClockWeatherView to support clock-only mode ([0c05820](https://github.com/teojs/clock-dashboard/commit/0c058203f2b1e7fa759af023a9e44e00813a0e74))

### [1.19.1](https://github.com/teojs/clock-dashboard/compare/v1.19.0...v1.19.1) (2026-01-20)


### Bug Fixes

* reduce idle timeout to 30 seconds for automatic homepage redirection and adjust button positioning in ClockWeatherView for better visibility ([ac13cd2](https://github.com/teojs/clock-dashboard/commit/ac13cd219aefb48f0c129588095579b80179d988))

## [1.19.0](https://github.com/teojs/clock-dashboard/compare/v1.18.0...v1.19.0) (2026-01-20)


### Features

* add new feedback issue template in Chinese to enhance user reporting experience ([31cb495](https://github.com/teojs/clock-dashboard/commit/31cb4955d56ca97063a7545844150885c2bb6a0d))
* enhance SmartHomeSettings with layout configuration options, update idle timeout for homepage redirection, and improve localization for layout settings ([a9fefb5](https://github.com/teojs/clock-dashboard/commit/a9fefb51bf591a49a066a9099cc8531b5f897a1c))
* integrate eruda for enhanced debugging in development, update postcss configuration and dependencies for improved styling capabilities ([786e6fe](https://github.com/teojs/clock-dashboard/commit/786e6feb106318e8e07a284606069a599ca16543))
* integrate vue-i18n for multilingual support across components and settings, enhancing user experience with language selection and localization ([93174c2](https://github.com/teojs/clock-dashboard/commit/93174c23ca841aa94ff1931cd517c47b27536da7))

## [1.18.0](https://github.com/teojs/clock-dashboard/compare/v1.17.0...v1.18.0) (2026-01-16)


### Features

* add @vueuse/core dependency and implement idle detection for automatic page return in App.vue ([871ef19](https://github.com/teojs/clock-dashboard/commit/871ef1968aa4f98257ab07d4da4e6f6b42692dc7))
* implement daily weather forecast functionality with modal display ([326b1bd](https://github.com/teojs/clock-dashboard/commit/326b1bd194e7a17ea5b7ad0e584cf3f5b1750861))
* integrate daily weather data into WeatherForecastModal and update API calls for enhanced forecast functionality ([3750b59](https://github.com/teojs/clock-dashboard/commit/3750b5908602612c3b630d0785d7c75398d033d1))


### Bug Fixes

* correct conditional rendering for holiday display in AlmanacModal to ensure accurate information presentation ([329a632](https://github.com/teojs/clock-dashboard/commit/329a6326270cef5bdde17c59a686f3c6d34d2665))
* prevent event propagation on click handlers in Weather and WeatherForecastModal components ([beb75f4](https://github.com/teojs/clock-dashboard/commit/beb75f4ecb7d5c5189be0bade0da6493fb3d908d))

## [1.17.0](https://github.com/teojs/clock-dashboard/compare/v1.16.3...v1.17.0) (2026-01-11)


### Features

* add holiday support to lunar date calculations and update CalendarView for holiday display ([bfa877f](https://github.com/teojs/clock-dashboard/commit/bfa877fc060de08e6e1799c64ec4d6349222b12f))
* implement AlmanacModal component for lunar date display and enhance LunarInfo type with additional properties ([43c9ec8](https://github.com/teojs/clock-dashboard/commit/43c9ec8ee4183f1d9119e4b1a8a41ea865e3af8f))


### Bug Fixes

* update iOS target version in Vite configuration from 12 to 9 for better compatibility ([ff33eb4](https://github.com/teojs/clock-dashboard/commit/ff33eb4245f7002a0a2da6e4b12a0c95dd7e9351))

### [1.16.3](https://github.com/teojs/clock-dashboard/compare/v1.16.2...v1.16.3) (2026-01-09)

### [1.16.2](https://github.com/teojs/clock-dashboard/compare/v1.16.1...v1.16.2) (2026-01-08)


### Bug Fixes

* conditionally render views in App.vue based on currentPage to improve navigation ([d570d3c](https://github.com/teojs/clock-dashboard/commit/d570d3cb914fb9d8ee941d3b5b2a4efa500498e0))

### [1.16.1](https://github.com/teojs/clock-dashboard/compare/v1.16.0...v1.16.1) (2026-01-08)


### Features

* add SFCompactRounded font family and update font weights in styles for improved typography ([7d6cea3](https://github.com/teojs/clock-dashboard/commit/7d6cea323b56b5b116b09d2f56602cd85857d541))

## [1.16.0](https://github.com/teojs/clock-dashboard/compare/v1.15.4...v1.16.0) (2026-01-07)


### Features

* add 24-hour format toggle in ClockSettingsModal and update time handling in useTime hook ([67048f9](https://github.com/teojs/clock-dashboard/commit/67048f91d9b11c9de04d95278e3d7f7ad0d7114f))
* add ClockSettingsModal component for customizable clock settings and integrate SF Pro Rounded font ([e52062f](https://github.com/teojs/clock-dashboard/commit/e52062f74371d0ae04ebcf4f06a248d7e647894c))
* add cross-origin loading tip in SmartSettingsModal to assist users with configuration ([ab2fee0](https://github.com/teojs/clock-dashboard/commit/ab2fee057fef272505de288141bb2b9e990eab34))
* enhance ClockWeatherView with computed baseDelay for dynamic digit delays based on clock settings ([a8486f7](https://github.com/teojs/clock-dashboard/commit/a8486f73b56ce93b8d6bf13b0a51b05f82acbfce))
* implement swipe detection and global click handling in App.vue for improved user interaction ([41d0140](https://github.com/teojs/clock-dashboard/commit/41d01404c163e17a7be3891db078f39c9ad9a53d))

### [1.15.4](https://github.com/teojs/clock-dashboard/compare/v1.15.3...v1.15.4) (2026-01-06)

### [1.15.3](https://github.com/teojs/clock-dashboard/compare/v1.15.2...v1.15.3) (2026-01-05)

### [1.15.2](https://github.com/teojs/clock-dashboard/compare/v1.15.1...v1.15.2) (2026-01-04)

### [1.15.1](https://github.com/teojs/clock-dashboard/compare/v1.15.0...v1.15.1) (2026-01-04)


### Bug Fixes

* reorder city name fallback logic in weather store to prioritize locality ([d88f47f](https://github.com/teojs/clock-dashboard/commit/d88f47f4b78f9b056ef45d191b4ac26e464ea1fe))

## [1.15.0](https://github.com/teojs/clock-dashboard/compare/v1.14.1...v1.15.0) (2026-01-03)


### Features

* add air quality data fetching and display in Weather component ([d20200b](https://github.com/teojs/clock-dashboard/commit/d20200b573acd9b908c23a5df3233098e403a464))
* enhance useTime hook to track last update date for lunar information updates ([f4626e4](https://github.com/teojs/clock-dashboard/commit/f4626e4334ead4f0c639bbd24416401466cadabc))


### Bug Fixes

* handle potential null values in air quality data display in Weather component ([88d607c](https://github.com/teojs/clock-dashboard/commit/88d607c77e1a6534f9ac305cdccb645a4fcebe73))

### [1.14.1](https://github.com/teojs/clock-dashboard/compare/v1.14.0...v1.14.1) (2025-12-31)


### Features

* Add visitor badge placeholder and inject badge during deployment. ([20da37d](https://github.com/teojs/clock-dashboard/commit/20da37d3321c603f0c4dbbda56361fdfe70e43a1))

## [1.14.0](https://github.com/teojs/clock-dashboard/compare/v1.13.0...v1.14.0) (2025-12-31)


### Features

* add getCurrentPosition function to enhance geolocation handling and improve location retrieval in weather store ([b34cb1c](https://github.com/teojs/clock-dashboard/commit/b34cb1cb35552e2c7b83a092b731bf9d3f546ab5))
* implement geocoding and weather APIs, enhancing location and weather data retrieval capabilities ([b7492ca](https://github.com/teojs/clock-dashboard/commit/b7492ca5535ab7724d21b079ba595ca67231e0ae))

## [1.13.0](https://github.com/teojs/clock-dashboard/compare/v1.12.1...v1.13.0) (2025-12-29)


### Features

* add New Year's Eve countdown and New Year's Day fireworks display component. ([2e8919f](https://github.com/teojs/clock-dashboard/commit/2e8919f8746f50ac282a05d06066b18822cecf5e))

### [1.12.1](https://github.com/teojs/clock-dashboard/compare/v1.12.0...v1.12.1) (2025-12-29)

## [1.12.0](https://github.com/teojs/clock-dashboard/compare/v1.11.0...v1.12.0) (2025-12-29)


### Features

* **style:** enhance Digit component to support showSeconds prop for improved display control ([f733672](https://github.com/teojs/clock-dashboard/commit/f733672ebe4347f77355bf586d8fd30bf14377a0))


### Bug Fixes

* **weather:** update button styles and disable state in WeatherSettingsModal ([1d06a73](https://github.com/teojs/clock-dashboard/commit/1d06a732eb411e2fcf834009ef0549f0e14d910f))

## [1.11.0](https://github.com/teojs/clock-dashboard/compare/v1.10.0...v1.11.0) (2025-12-29)


### Features

* **docker:** add Docker support with build and publish workflow ([9059627](https://github.com/teojs/clock-dashboard/commit/9059627a80b15d80c8328fa0efcc3d92e9ce12ff))
* **weather:** implement city search functionality in WeatherSettingsModal ([df704cd](https://github.com/teojs/clock-dashboard/commit/df704cdac2c1cc76ac78b67e2b957857e47b13d4))


### Bug Fixes

* **weather:** update location mode handling and improve UI for coordinates input in WeatherSettingsModal ([493c712](https://github.com/teojs/clock-dashboard/commit/493c712e8ce142f57eccb2ae8e3718a32dae134d))

## [1.10.0](https://github.com/teojs/clock-dashboard/compare/v1.9.0...v1.10.0) (2025-12-26)


### Features

* **clock:** implement touch and mouse interaction for toggling seconds display ([857eec5](https://github.com/teojs/clock-dashboard/commit/857eec5b5235a2062231f60175d03282b4af15e1))
* integrate Pinia for state management and refactor weather components ([11f51a0](https://github.com/teojs/clock-dashboard/commit/11f51a0fe83fa55ddd26d01047ddaaa894d1ffe9))
* **weather:** add snow effects to WeatherEffects component ([8d4ae65](https://github.com/teojs/clock-dashboard/commit/8d4ae65894f0c547f5df0cdc9a0ca3fb4ebce57a))
* **weather:** enhance weather effects rendering logic in App.vue ([cf5d700](https://github.com/teojs/clock-dashboard/commit/cf5d7007f3c4bb37c7062122f500903844c41092))
* **weather:** implement local draft management in WeatherSettingsModal ([3908241](https://github.com/teojs/clock-dashboard/commit/3908241fdbfa725f4c4ec47d268f391401f584dd))
* **weather:** implement weather settings modal and enhance settings management ([e1c2bc3](https://github.com/teojs/clock-dashboard/commit/e1c2bc35fd11e6f88b82bdcc97dd3243858cc904))

## [1.9.0](https://github.com/teojs/clock-dashboard/compare/v1.8.0...v1.9.0) (2025-12-26)


### Features

* **weather:** integrate weather effects component and refactor weather logic ([b03a5f1](https://github.com/teojs/clock-dashboard/commit/b03a5f130a96ba5f6b59045c3535ac3316f8c5a6))

## [1.8.0](https://github.com/teojs/clock-dashboard/compare/v1.7.0...v1.8.0) (2025-12-24)


### Features

* **weather:** enhance weather fetching logic and improve icon path ([6e92baf](https://github.com/teojs/clock-dashboard/commit/6e92bafd50a77ab6a9c0ac75dd69cb0d61ff68a3))

## [1.7.0](https://github.com/teojs/clock-dashboard/compare/v1.6.3...v1.7.0) (2025-12-24)


### Features

* **weather:** add weather icons and update weather data fetching logic ([5f280f9](https://github.com/teojs/clock-dashboard/commit/5f280f9437325910adbfe25d8d1f864f6572b1a5))

### [1.6.3](https://github.com/teojs/clock-dashboard/compare/v1.6.2...v1.6.3) (2025-12-24)


### Bug Fixes

* **settings:** remove unnecessary class from SettingsModal for cleaner layout ([7285ce3](https://github.com/teojs/clock-dashboard/commit/7285ce3d9a9482d24d02ae587404a0e8a7708c0a))

### [1.6.2](https://github.com/teojs/clock-dashboard/compare/v1.6.1...v1.6.2) (2025-12-23)

### [1.6.1](https://github.com/teojs/clock-dashboard/compare/v1.6.0...v1.6.1) (2025-12-23)

## [1.6.0](https://github.com/teojs/clock-dashboard/compare/v1.5.1...v1.6.0) (2025-12-23)


### Features

* **settings:** add cross-origin loading tips in SettingsModal for improved user guidance ([99066a8](https://github.com/teojs/clock-dashboard/commit/99066a83dcf75ea12087d171339a34df4a1b203e))


### Bug Fixes

* **weather:** adjust layout and replace thermometer icon with person standing icon for improved visual consistency ([c3b7328](https://github.com/teojs/clock-dashboard/commit/c3b7328905ef048408950794e6959ddb5c181b24))

### [1.5.1](https://github.com/teojs/clock-dashboard/compare/v1.5.0...v1.5.1) (2025-12-22)

## [1.5.0](https://github.com/teojs/clock-dashboard/compare/v1.4.0...v1.5.0) (2025-12-22)


### Features

* **weather:** update weather component layout and styling, adding precipitation probability and apparent temperature display for enhanced user experience ([edde92b](https://github.com/teojs/clock-dashboard/commit/edde92b2e97ef8febb6474c2795a4adc2f939990))

## [1.4.0](https://github.com/teojs/clock-dashboard/compare/v1.3.0...v1.4.0) (2025-12-22)


### Features

* **weather:** add humidity and wind speed icons to the weather component for enhanced visual representation ([7725bfd](https://github.com/teojs/clock-dashboard/commit/7725bfd12695d077672af3eaaa373e668371574e))
* **weather:** enhance weather component with additional metrics including UV index, precipitation probability, and apparent temperature for improved user insights ([597e4dc](https://github.com/teojs/clock-dashboard/commit/597e4dce3ce497566d1c7d14254e02e78406a87e))

## [1.3.0](https://github.com/teojs/clock-dashboard/compare/v1.2.1...v1.3.0) (2025-12-22)


### Features

* **lunar:** enhance lunar date display with festival information and update related components ([74565d4](https://github.com/teojs/clock-dashboard/commit/74565d4d6ffcc47a154bbd8044dc11812e510c4f))

### [1.2.1](https://github.com/teojs/clock-dashboard/compare/v1.2.0...v1.2.1) (2025-12-22)

## [1.2.0](https://github.com/teojs/clock-dashboard/compare/v1.1.0...v1.2.0) (2025-12-22)


### Features

* **weather:** display actual city name instead of coordinates using reverse geocoding ([7410555](https://github.com/teojs/clock-dashboard/commit/7410555af8be7e77fe4997e5d5d2f14bd6bcb7eb))

## [1.1.0](https://github.com/teojs/clock-dashboard/compare/v1.0.5...v1.1.0) (2025-12-22)


### Features

* **SmartHome:** add climate information display and enhance settings modal with entity states ([c39f974](https://github.com/teojs/clock-dashboard/commit/c39f9746500d987fdd7745972c99e95edebc3317))

### [1.0.5](https://github.com/teojs/clock-dashboard/compare/v1.0.4...v1.0.5) (2025-12-22)

### [1.0.4](https://github.com/teojs/clock-dashboard/compare/v1.0.3...v1.0.4) (2025-12-22)

### [1.0.3](https://github.com/teojs/clock-dashboard/compare/v1.0.2...v1.0.3) (2025-12-22)


### Bug Fixes

* **Weather:** correct latitude and longitude order in location text ([0a1e507](https://github.com/teojs/clock-dashboard/commit/0a1e5077eb0c69489eab6a722c153b3ec36318f6))

### [1.0.2](https://github.com/teojs/clock-dashboard/compare/v1.0.1...v1.0.2) (2025-12-22)

### 1.0.1 (2025-12-22)
