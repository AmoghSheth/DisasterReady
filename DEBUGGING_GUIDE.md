# Debugging Guide for DisasterReady App

## Recent Chages Made

### 1. ✅ Gemini AI Integration (Fixed)
The app now properly uses **Google Gemini AI** for risk assessment instead of falling back to the local system.

### 2. ✅ Comprehensive Alert Debugging
Added extensive logging throughout the alert fetching system to help diagnose why alerts aren't being found.

---

## How to Debug

### Open Browser Console
1. Open your app in the browser
2. Press **F12** (or **Cmd+Option+I** on Mac)
3. Click the **Console** tab
4. Reload the page

---

## What to Look For in Console

### 🤖 **Gemini AI Assessment**

Look for these logs:
```
[Gemini AI] Starting AI risk assessment...
[Gemini AI] API key found, proceeding with assessment
[Gemini AI] Sending prompt to Gemini API
[Gemini AI] Response status: 200
[Gemini AI] Final result: { level: 'low', message: '...', source: 'Google Gemini AI' }
```

**Success indicators:**
- ✅ Response status: **200**
- ✅ Source shows: **"Google Gemini AI"**

**If failing:**
- ❌ Response status: **401** = API key invalid
- ❌ Response status: **429** = Rate limit exceeded
- ❌ Response status: **400** = Bad request format
- ❌ "Could not extract JSON from response" = Gemini returned unexpected format

---

### 🚨 **Alerts Debugging**

The system fetches from **3 sources**. Look for these log sections:

#### 1. **OpenWeatherMap Alerts**
```
[OpenWeatherMap Alerts] Fetching alerts for coordinates: 40.7128, -74.0060
[OpenWeatherMap Alerts] Request URL: https://api.openweathermap.org/data/3.0/onecall?...
[OpenWeatherMap Alerts] Response status: 200
[OpenWeatherMap Alerts] Number of alerts: 0
```

#### 2. **NWS (National Weather Service) Alerts**
```
[NWS Alerts] Fetching alerts for coordinates: 40.7128, -74.0060
[NWS Alerts] Active alerts URL: https://api.weather.gov/alerts/active?point=40.7128,-74.0060
[NWS Alerts] Active alerts response status: 200
[NWS Alerts] Number of active alerts: 0
[NWS Alerts] No active alerts found, fetching historical alerts...
[NWS Alerts] Historical alerts count: 3
[NWS Alerts] Found historical alerts: ['Small Craft Advisory', 'Wind Advisory', 'Flood Watch']
```

#### 3. **FEMA Disasters**
```
[FEMA Disasters] Fetching disasters for state: NY
[FEMA Disasters] Response status: 200
[FEMA Disasters] Number of disasters found: 5
[FEMA Disasters] Disasters: ['Severe Storms - ...', 'Hurricane - ...']
```

#### 4. **Combined Results**
```
[getAllAlerts] ===== STARTING COMPREHENSIVE ALERT FETCH =====
[getAllAlerts] Parameters: { zip: '10001', lat: 40.7128, lon: -74.0060, state: 'NY' }
[getAllAlerts] ✅ OpenWeatherMap: 0 alerts
[getAllAlerts] ✅ NWS: 3 alerts
[getAllAlerts] ✅ FEMA: 5 disasters
[getAllAlerts] ===== TOTAL ALERTS: 8 =====
```

---

## Changes Made to Alert Fetching

### Increased Time Ranges:
- **NWS Historical**: 7 days → **30 days**
- **FEMA Disasters**: 30 days → **90 days**
- **FEMA Results**: 20 → **50 disasters**

### Added Comprehensive Logging:
- Every API request logs the URL
- Every response logs the status code
- Every alert source logs the count of alerts found
- Error messages include full error details

---

## Common Issues & Solutions

### Issue 1: No Alerts Found
**Console shows:**
```
[getAllAlerts] ===== TOTAL ALERTS: 0 =====
```

**Possible reasons:**
1. ✅ **Your area is safe** - No active or recent alerts (good news!)
2. ❌ **Location not set** - Check if ZIP code and coordinates are correct
3. ❌ **API errors** - Look for error messages in console

**What to check:**
- Are coordinates correct? (Check the `[getAllAlerts] Parameters` log)
- Is the state detected? (Should show like `state: 'NY'`)
- Are all 3 APIs returning status **200**?

### Issue 2: Gemini AI Not Working
**Console shows:**
```
[Dashboard] ⚠️ AI assessment failed, falling back to local risk assessment
```

**Possible reasons:**
1. ❌ **API key invalid** - Check `.env` file has correct key
2. ❌ **Rate limit** - Gemini has usage limits
3. ❌ **Network error** - Check internet connection

**What to check:**
- Look for `[Gemini AI] Response status:` - should be **200**
- Check if `[Gemini AI] API key found` appears
- Look for any `[Gemini AI] API error:` messages

### Issue 3: OpenWeatherMap One Call API Errors
**Console shows:**
```
[OpenWeatherMap Alerts] API failed with status 401
```

**Solutions:**
- **401** = Invalid API key - Check `.env` has correct key
- **429** = Rate limit - Wait a few minutes
- **404** = Endpoint not found - Verify One Call API 3.0 subscription is active

---

## Testing Different Locations

To test with locations that might have more alerts:

1. **California (Wildfires)**: Try ZIP `90001` (Los Angeles)
2. **Florida (Hurricanes)**: Try ZIP `33101` (Miami)
3. **Texas (Severe Weather)**: Try ZIP `77001` (Houston)
4. **Midwest (Tornadoes)**: Try ZIP `73301` (Oklahoma City)

Change your ZIP code in the Profile/Settings page and reload.

---

## API Endpoints Being Called

### Gemini AI
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

### OpenWeatherMap One Call API 3.0
```
GET https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude=minutely,hourly,daily&units=imperial
```

### NWS Active Alerts
```
GET https://api.weather.gov/alerts/active?point={lat},{lon}
```

### NWS Historical Alerts (if no active)
```
GET https://api.weather.gov/alerts?point={lat},{lon}&start={30_days_ago}
```

### FEMA Disasters
```
GET https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$filter=state eq '{state}' and declarationDate ge '{90_days_ago}'&$top=50
```

---

## Expected Console Output (Full Example)

When everything works correctly, you should see:

```
[Dashboard] Attempting to get AI risk assessment from Gemini...
[Gemini AI] Starting AI risk assessment...
[Gemini AI] API key found, proceeding with assessment
[Gemini AI] Sending prompt to Gemini API
[Gemini AI] Response status: 200
[Gemini AI] Final result: {level: 'low', message: 'Weather conditions are stable...', source: 'Google Gemini AI'}
[Dashboard] ✅ AI assessment received from Gemini: {level: 'low', ...}
[Dashboard] Source: Google Gemini AI

[getAllAlerts] ===== STARTING COMPREHENSIVE ALERT FETCH =====
[getAllAlerts] Parameters: {zip: '10001', lat: 40.7128, lon: -74.006, state: 'NY'}

[OpenWeatherMap Alerts] Fetching alerts for coordinates: 40.7128, -74.006
[OpenWeatherMap Alerts] Response status: 200
[OpenWeatherMap Alerts] Number of alerts: 0

[NWS Alerts] Fetching alerts for coordinates: 40.7128, -74.006
[NWS Alerts] Active alerts response status: 200
[NWS Alerts] Number of active alerts: 0
[NWS Alerts] No active alerts found, fetching historical alerts...
[NWS Alerts] Historical alerts count: 2

[FEMA Disasters] Fetching disasters for state: NY
[FEMA Disasters] Response status: 200
[FEMA Disasters] Number of disasters found: 3

[getAllAlerts] ✅ OpenWeatherMap: 0 alerts
[getAllAlerts] ✅ NWS: 2 alerts
[getAllAlerts] ✅ FEMA: 3 disasters
[getAllAlerts] ===== TOTAL ALERTS: 5 =====
```

---

## Next Steps

1. **Open browser console** (F12)
2. **Reload the page**
3. **Check the logs** above
4. **Share the console output** if you need help debugging

The comprehensive logging will show exactly where the issue is!
