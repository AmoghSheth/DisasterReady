# OpenWeatherMap One Call API 3.0 - Usage Documentation

## Overview
This app nw uses **OpenWeather One Call API 3.0** subscription. All API calls have been updated to use the 3.0 endpoints with proper parameters.

## API Subscription Details
- **Product**: One Call API 3.0 ("One Call by Call" subscription)
- **Pricing**: Pay-per-call model (1,000 free calls/day included)
- **Update Frequency**: Every 10 minutes (recommended request interval)
- **Units**: Imperial (Fahrenheit for temperature, miles/hour for wind speed)

## API Key Configuration
The API key is stored in `.env` file:
```
OPENWEATHERMAP_API_KEY=your_api_key_here
```

---

## All OpenWeatherMap API Usage Locations

### 1. **Main Weather Data Function** - `/src/utils/externalData.ts`

#### `getWeatherByLocation(location: { lat: number; lng: number })`
**API Endpoint Used**: One Call API 3.0
```
https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&units=imperial&appid={API_KEY}
```

**What it fetches**:
- ✅ Current weather (temperature, humidity, pressure, wind, clouds, visibility, UV index)
- ✅ Hourly forecast for 48 hours
- ✅ Daily forecast for 8 days  
- ✅ Government weather alerts
- ✅ Timezone information

**Response includes**:
- `current` - Current weather conditions
- `hourly` - 48-hour hourly forecast
- `daily` - 8-day daily forecast
- `alerts` - Weather alerts from national agencies
- `timezone` - Timezone name
- `timezone_offset` - UTC offset

**Used by**:
- Dashboard page (`/src/pages/Dashboard.tsx` line 65)
- Indirectly by `getWeatherByZip()` function

---

#### `getWeatherByZip(zip: string)`
**API Endpoints Used**:
1. Geocoding API (to convert ZIP to coordinates):
   ```
   https://api.openweathermap.org/geo/1.0/zip?zip={zip},US&appid={API_KEY}
   ```
2. One Call API 3.0 (via `getWeatherByLocation()`)

**Used by**:
- Alerts page (`/src/pages/Alerts.tsx` line 44)
- Plan page (`/src/pages/Plan.tsx` line 69)

---

#### `getOpenWeatherMapAlerts(lat: number, lon: number)`
**API Endpoint Used**: One Call API 3.0 (optimized for alerts only)
```
https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly,daily&units=imperial&appid={API_KEY}
```

**Exclusions**: minutely, hourly, daily (to reduce data transfer and costs)

**What it fetches**:
- ✅ Current weather alerts only
- ✅ Government alerts from national weather agencies

**Used by**:
- `getAllAlerts()` function for comprehensive alert compilation

---

#### `getAllAlerts(zip: string, lat: number, lon: number, state: string | null)`
**API Sources Combined**:
1. OpenWeatherMap One Call API 3.0 (via `getOpenWeatherMapAlerts()`)
2. NWS (National Weather Service)
3. FEMA

**Used by**:
- Alerts page (`/src/pages/Alerts.tsx` line 51)

---

### 2. **Geocoding API** - `/src/utils/externalData.ts`

#### Reverse Geocoding (Coordinates → Address)
**API Endpoint**:
```
https://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={API_KEY}
```

**Used in**:
- `getWeatherByLocation()` (line 17) - To get state information for FEMA API

#### ZIP Code Geocoding (ZIP → Coordinates)
**API Endpoint**:
```
https://api.openweathermap.org/geo/1.0/zip?zip={zip},US&appid={API_KEY}
```

**Used in**:
- `getWeatherByZip()` (line 88) - To convert ZIP code to lat/lon coordinates

---

## API Response Structure (One Call API 3.0)

### Current Weather (`current`)
```json
{
  "dt": 1684929490,
  "sunrise": 1684926645,
  "sunset": 1684977332,
  "temp": 292.55,
  "feels_like": 292.87,
  "pressure": 1014,
  "humidity": 89,
  "uvi": 0.16,
  "clouds": 53,
  "visibility": 10000,
  "wind_speed": 3.13,
  "wind_deg": 93,
  "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04d" }]
}
```

### Hourly Forecast (`hourly[48]`)
```json
{
  "dt": 1684926000,
  "temp": 292.01,
  "feels_like": 292.33,
  "pressure": 1014,
  "humidity": 91,
  "wind_speed": 2.58,
  "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04n" }],
  "pop": 0.15
}
```

### Daily Forecast (`daily[8]`)
```json
{
  "dt": 1684951200,
  "sunrise": 1684926645,
  "sunset": 1684977332,
  "summary": "Expect a day of partly cloudy with rain",
  "temp": {
    "day": 299.03,
    "min": 290.69,
    "max": 300.35,
    "night": 291.45,
    "eve": 297.51,
    "morn": 292.55
  },
  "weather": [{ "id": 500, "main": "Rain", "description": "light rain", "icon": "10d" }],
  "pop": 0.47,
  "uvi": 9.23
}
```

### Alerts (`alerts[]`)
```json
{
  "sender_name": "NWS Philadelphia - Mount Holly",
  "event": "Small Craft Advisory",
  "start": 1684952747,
  "end": 1684988747,
  "description": "...SMALL CRAFT ADVISORY REMAINS IN EFFECT...",
  "tags": []
}
```

---

## Summary of All API Calls

### Per Page Load:

**Dashboard Page**:
- 1× One Call API 3.0 (full data: current + hourly + daily + alerts)
- 1× Geocoding API (reverse geocoding)
- Total: **2 OpenWeatherMap API calls**

**Alerts Page**:
- 1× Geocoding API (ZIP to coordinates)
- 1× One Call API 3.0 (alerts only via `getAllAlerts`)
- Total: **2 OpenWeatherMap API calls**

**Plan Page**:
- 1× Geocoding API (ZIP to coordinates)
- 1× One Call API 3.0 (full data)
- Total: **2 OpenWeatherMap API calls**

### Estimated Daily Usage:
- Average user: ~6-10 OpenWeatherMap API calls per session
- With 1,000 free calls/day: ~100-166 user sessions covered
- Recommended: Request weather data every 10 minutes (per OpenWeather recommendation)

---

## Data Coverage

### Geographic Coverage:
- ✅ **Worldwide**: One Call API 3.0 provides global coverage

### Weather Data Includes:
- ✅ Current conditions
- ✅ Minute-by-minute forecast (1 hour)
- ✅ Hourly forecast (48 hours)
- ✅ Daily forecast (8 days)
- ✅ Government weather alerts (from 100+ national agencies)
- ✅ Historical data available (46+ years via Time Machine endpoint - not currently used)

### Alert Sources:
OpenWeatherMap aggregates alerts from **100+ national weather agencies** including:
- 🇺🇸 USA: NOAA National Weather Service, IPAWS
- 🇬🇧 UK: Met Office
- 🇨🇦 Canada: Meteorological Service
- 🇦🇺 Australia: Bureau of Meteorology
- And many more (see full list in documentation)

---

## API Parameters Used

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `lat` | User latitude | Location coordinate |
| `lon` | User longitude | Location coordinate |
| `units` | `imperial` | Fahrenheit & mph |
| `exclude` | `minutely,hourly,daily` | Reduce data for alerts-only calls |
| `appid` | API key | Authentication |

---

## API Limits & Best Practices

### Current Settings:
- ✅ Using One Call API 3.0 (correct endpoint)
- ✅ Imperial units for US users
- ✅ Combining with NWS and FEMA for comprehensive alerts
- ✅ Excluding unnecessary data when fetching alerts only

### Recommendations:
1. **Cache responses** for 10 minutes (OpenWeather updates every 10 min)
2. **Monitor API usage** in OpenWeather dashboard
3. **Consider adding loading states** to prevent duplicate calls
4. **Add error handling** for rate limit responses (HTTP 429)

---

## Future Enhancements Available

### Additional One Call API 3.0 Endpoints (Not Currently Used):

1. **Time Machine** - Historical weather data
   ```
   https://api.openweathermap.org/data/3.0/onecall/timemachine?lat={lat}&lon={lon}&dt={timestamp}&appid={API_KEY}
   ```
   - Access 46+ years of historical data
   - 4 days ahead forecast

2. **Daily Aggregation** - Aggregated daily statistics
   ```
   https://api.openweathermap.org/data/3.0/onecall/day_summary?lat={lat}&lon={lon}&date={YYYY-MM-DD}&appid={API_KEY}
   ```
   - 46+ years archive
   - 1.5 years ahead forecast

3. **Weather Overview** - AI-generated summary
   ```
   https://api.openweathermap.org/data/3.0/onecall/overview?lat={lat}&lon={lon}&appid={API_KEY}
   ```
   - Human-readable weather summary
   - Today and tomorrow forecast

---

## Migration Notes

### Changed from 2.5 to 3.0:
- ✅ Base URL: `data/2.5` → `data/3.0`
- ✅ Endpoint: `/onecall` (now uses 3.0 version)
- ✅ Response structure: Compatible (mostly same structure)
- ✅ Alerts: Now included in main response

### Backward Compatibility:
The app maintains compatibility by:
- Reformatting One Call API 3.0 response to match old structure
- Extracting hourly forecast (first 40 entries)
- Combining One Call alerts with NWS alerts

---

## Testing Checklist

- [x] Dashboard loads weather data
- [x] Alerts page shows alerts from all sources
- [x] Plan page displays weather warnings
- [x] Geocoding works for ZIP codes
- [x] Imperial units (°F, mph) display correctly
- [x] Alerts are properly parsed and displayed
- [x] Error handling for missing API key
- [x] No breaking changes to existing UI

---

**Last Updated**: December 2024  
**API Version**: OpenWeather One Call API 3.0  
**Documentation**: https://openweathermap.org/api/one-call-3
