
// Utility for weather and disaster data

const OPENWEATHERMAP_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
const OPENWEATHERMAP_BASE_V3 = 'https://api.openweathermap.org/data/3.0';
const FEMA_BASE = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries';

export async function getWeatherByLocation(location: { lat: number; lng: number }) {
  if (!OPENWEATHERMAP_API_KEY || OPENWEATHERMAP_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
    console.error("FATAL: OpenWeatherMap API key is missing or is a placeholder. Please add your key to the .env file and restart the server.");
    throw new Error('Missing OpenWeatherMap API Key');
  }

  const { lat, lng } = location;

  // Fetch reverse geocoding data to get state for FEMA
  const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`);
  if (!geoRes.ok) throw new Error('Failed to get location for coordinates');
  const geoData = await geoRes.json();
  const geo = geoData[0] || {};

  // Use One Call API 3.0 to get current weather, forecasts, and alerts in one call
  const oneCallUrl = `${OPENWEATHERMAP_BASE_V3}/onecall?lat=${lat}&lon=${lng}&units=imperial&appid=${OPENWEATHERMAP_API_KEY}`;
  const oneCallRes = await fetch(oneCallUrl);
  if (!oneCallRes.ok) throw new Error('Failed to fetch weather data from One Call API 3.0');
  const oneCallData = await oneCallRes.json();

  // Extract current weather (format similar to old API for compatibility)
  const weather = {
    main: {
      temp: oneCallData.current?.temp,
      feels_like: oneCallData.current?.feels_like,
      pressure: oneCallData.current?.pressure,
      humidity: oneCallData.current?.humidity,
    },
    weather: oneCallData.current?.weather || [],
    wind: {
      speed: oneCallData.current?.wind_speed,
      deg: oneCallData.current?.wind_deg,
    },
    clouds: { all: oneCallData.current?.clouds },
    dt: oneCallData.current?.dt,
    sys: {
      sunrise: oneCallData.current?.sunrise,
      sunset: oneCallData.current?.sunset,
    },
    visibility: oneCallData.current?.visibility,
    uvi: oneCallData.current?.uvi,
  };

  // Extract hourly forecast (first 40 entries to match old 5-day forecast format)
  const forecast = (oneCallData.hourly || []).slice(0, 40);

  // Extract alerts from One Call API and combine with NWS alerts
  const owmAlerts = (oneCallData.alerts || []).map((alert: any) => ({
    event: alert.event,
    description: alert.description,
    severity: alert.tags?.includes('Extreme') ? 'Extreme' : alert.tags?.includes('Severe') ? 'Severe' : 'Moderate',
    start: alert.start,
    end: alert.end,
    sender: alert.sender_name || 'OpenWeatherMap',
    tags: alert.tags || []
  }));

  // Also fetch NWS alerts for additional coverage
  const nwsAlerts = await getNwsAlertsByLatLon(lat, lng);
  
  // Combine alerts from both sources
  const alerts = [...owmAlerts, ...nwsAlerts];

  return {
    geo,
    weather,
    forecast,
    alerts,
    daily: oneCallData.daily || [], // Include daily forecast
    timezone: oneCallData.timezone,
    timezone_offset: oneCallData.timezone_offset,
  };
}

export async function getWeatherByZip(zip: string) {
  if (!OPENWEATHERMAP_API_KEY || OPENWEATHERMAP_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
    console.error("FATAL: OpenWeatherMap API key is missing or is a placeholder. Please add your key to the .env file and restart the server.");
    throw new Error('Missing OpenWeatherMap API Key');
  }

  const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/zip?zip=${zip},US&appid=${OPENWEATHERMAP_API_KEY}`);
  if (!geoRes.ok) throw new Error('Failed to get location for ZIP');
  const geo = await geoRes.json();
  const { lat, lon } = geo;

  return getWeatherByLocation({ lat, lng: lon });
}

export async function getFemaDisastersByState(state: string) {
  console.log(`[FEMA Disasters] Fetching disasters for state: ${state}`);
  
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const url = `${FEMA_BASE}?$filter=state eq '${state}' and declarationDate ge '${ninetyDaysAgo}'&$orderby=declarationDate desc&$top=50`;
  console.log(`[FEMA Disasters] Request URL: ${url}`);
  
  const res = await fetch(url);
  console.log(`[FEMA Disasters] Response status: ${res.status}`);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[FEMA Disasters] API request failed with status ${res.status}:`, errorText);
    throw new Error('Failed to fetch FEMA disasters');
  }
  
  const data = await res.json();
  console.log(`[FEMA Disasters] Number of disasters found: ${data.DisasterDeclarationsSummaries?.length || 0}`);
  
  if (data.DisasterDeclarationsSummaries && data.DisasterDeclarationsSummaries.length > 0) {
    console.log('[FEMA Disasters] Disasters:', data.DisasterDeclarationsSummaries.map((d: any) => `${d.incidentType} - ${d.declarationTitle}`));
  }
  
  return data.DisasterDeclarationsSummaries || [];
}

export async function getNwsAlertsByLatLon(lat: number, lon: number) {
  console.log(`[NWS Alerts] Fetching alerts for coordinates: ${lat}, ${lon}`);
  
  const url = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;
  console.log(`[NWS Alerts] Active alerts URL: ${url}`);
  
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'DisasterReadyApp/1.0' } });
    console.log(`[NWS Alerts] Active alerts response status: ${res.status}`);
    
    if (!res.ok) {
      console.error(`[NWS Alerts] Failed to fetch active alerts: ${res.status} ${res.statusText}`);
      throw new Error('Failed to fetch NWS alerts');
    }
    
    const data = await res.json();
    console.log(`[NWS Alerts] Active alerts raw response:`, data);
    console.log(`[NWS Alerts] Number of active alerts: ${data.features?.length || 0}`);
    
    const alerts = (data.features || []).map((feature: any) => ({
      event: feature.properties.event,
      description: feature.properties.description,
      severity: feature.properties.severity,
      start: new Date(feature.properties.onset || feature.properties.effective).getTime() / 1000,
      end: new Date(feature.properties.ends || feature.properties.expires).getTime() / 1000,
      sender: feature.properties.senderName,
      id: feature.id
    }));
    
    // If no active alerts, try to fetch recent alerts from the past 30 days (increased from 7)
    if (alerts.length === 0) {
      console.log('[NWS Alerts] No active alerts found, fetching historical alerts...');
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const histUrl = `https://api.weather.gov/alerts?point=${lat},${lon}&start=${thirtyDaysAgo}`;
        console.log(`[NWS Alerts] Historical alerts URL: ${histUrl}`);
        
        const histRes = await fetch(histUrl, { headers: { 'User-Agent': 'DisasterReadyApp/1.0' } });
        console.log(`[NWS Alerts] Historical alerts response status: ${histRes.status}`);
        
        if (histRes.ok) {
          const histData = await histRes.json();
          console.log(`[NWS Alerts] Historical alerts count: ${histData.features?.length || 0}`);
          
          if (histData.features && histData.features.length > 0) {
            console.log('[NWS Alerts] Found historical alerts:', histData.features.map((f: any) => f.properties.event));
          }
          
          return (histData.features || []).map((feature: any) => ({
            event: feature.properties.event,
            description: feature.properties.description,
            severity: feature.properties.severity,
            start: new Date(feature.properties.onset || feature.properties.effective).getTime() / 1000,
            end: new Date(feature.properties.ends || feature.properties.expires).getTime() / 1000,
            sender: feature.properties.senderName,
            id: feature.id
          }));
        }
      } catch (e) {
        console.error('[NWS Alerts] Error fetching historical alerts:', e);
      }
    } else {
      console.log('[NWS Alerts] Active alerts found:', alerts.map(a => a.event));
    }
    
    return alerts;
  } catch (error) {
    console.error('[NWS Alerts] Error in getNwsAlertsByLatLon:', error);
    return [];
  }
}

export async function getAIAssessment(weatherData: any) {
  console.log('[Gemini AI] Starting AI risk assessment...');
  
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('[Gemini AI] API key not configured');
    return null;
  }

  console.log('[Gemini AI] API key found, proceeding with assessment');

  try {
    // Create a detailed prompt with weather data
    const currentTemp = weatherData.weather?.main?.temp || 'N/A';
    const feelsLike = weatherData.weather?.main?.feels_like || 'N/A';
    const humidity = weatherData.weather?.main?.humidity || 'N/A';
    const windSpeed = weatherData.weather?.wind?.speed || 'N/A';
    const weatherDesc = weatherData.weather?.weather?.[0]?.description || 'N/A';
    const alertsCount = weatherData.alerts?.length || 0;
    
    const prompt = `You are a disaster preparedness AI assistant. Analyze the following weather data and provide a risk assessment.

CURRENT WEATHER:
- Temperature: ${currentTemp}°F (feels like ${feelsLike}°F)
- Conditions: ${weatherDesc}
- Humidity: ${humidity}%
- Wind Speed: ${windSpeed} mph

ALERTS: ${alertsCount} active weather alert(s)
${alertsCount > 0 ? weatherData.alerts.map((a: any) => `- ${a.event}: ${a.description?.substring(0, 100)}...`).join('\n') : 'No active alerts'}

FORECAST: ${weatherData.forecast?.length || 0} forecast periods available

Based on this data, provide a risk assessment in JSON format with:
{
  "level": "low" | "medium" | "high" | "severe",
  "message": "A concise 1-2 sentence summary of the current risk",
  "recommendation": "Specific action items for the user to stay safe"
}

Respond ONLY with the JSON object, no markdown, no extra text.`;

    console.log('[Gemini AI] Sending prompt to Gemini API');
    console.log('[Gemini AI] Prompt preview:', prompt.substring(0, 200) + '...');

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    console.log('[Gemini AI] API URL:', apiUrl.replace(GEMINI_API_KEY, 'API_KEY_HIDDEN'));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      })
    });

    console.log('[Gemini AI] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gemini AI] API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[Gemini AI] Raw response:', JSON.stringify(data, null, 2));
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('[Gemini AI] Extracted text:', text);
    
    if (!text) {
      console.error('[Gemini AI] No text in response');
      return null;
    }
    
    // Extract JSON from response (handle various formats)
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Try to find JSON in code blocks
      jsonMatch = text.match(/```json\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }
    
    if (!jsonMatch) {
      console.error('[Gemini AI] Could not extract JSON from response');
      console.error('[Gemini AI] Response text:', text);
      return null;
    }
    
    console.log('[Gemini AI] Extracted JSON string:', jsonMatch[0]);
    
    const assessment = JSON.parse(jsonMatch[0]);
    console.log('[Gemini AI] Parsed assessment:', assessment);
    
    const result = {
      ...assessment,
      source: 'Google Gemini AI'
    };
    
    console.log('[Gemini AI] Final result:', result);
    return result;
  } catch (error) {
    console.error('[Gemini AI] Error calling Gemini API:', error);
    if (error instanceof Error) {
      console.error('[Gemini AI] Error message:', error.message);
      console.error('[Gemini AI] Error stack:', error.stack);
    }
    return null;
  }
}

export async function getAI5DayRiskForecast(forecastData: any[]) {
  console.warn('[AI Disabled] Skipping client-side AI 5-day risk forecast to avoid exposing API keys.');
  return null;
}

// Get OpenWeatherMap alerts using One Call API 3.0
export async function getOpenWeatherMapAlerts(lat: number, lon: number) {
  console.log(`[OpenWeatherMap Alerts] Fetching alerts for coordinates: ${lat}, ${lon}`);
  
  if (!OPENWEATHERMAP_API_KEY || OPENWEATHERMAP_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
    console.error('[OpenWeatherMap Alerts] API key not configured');
    return [];
  }

  try {
    // Use One Call API 3.0 with only current and alerts data
    const url = `${OPENWEATHERMAP_BASE_V3}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&units=imperial&appid=${OPENWEATHERMAP_API_KEY}`;
    console.log(`[OpenWeatherMap Alerts] Request URL: ${url}`);
    
    const res = await fetch(url);
    console.log(`[OpenWeatherMap Alerts] Response status: ${res.status}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[OpenWeatherMap Alerts] API failed with status ${res.status}:`, errorText);
      return [];
    }
    
    const data = await res.json();
    console.log(`[OpenWeatherMap Alerts] Response data:`, data);
    console.log(`[OpenWeatherMap Alerts] Number of alerts: ${data.alerts?.length || 0}`);
    
    const alerts = (data.alerts || []).map((alert: any) => {
      console.log(`[OpenWeatherMap Alerts] Alert found:`, alert.event, alert.tags);
      return {
        event: alert.event,
        description: alert.description,
        severity: alert.tags?.includes('Extreme') ? 'severe' : alert.tags?.includes('Severe') ? 'high' : 'moderate',
        start: alert.start,
        end: alert.end,
        sender: alert.sender_name || 'OpenWeatherMap',
        tags: alert.tags || []
      };
    });
    
    console.log(`[OpenWeatherMap Alerts] Processed alerts:`, alerts);
    return alerts;
  } catch (error) {
    console.error('[OpenWeatherMap Alerts] Error fetching alerts:', error);
    return [];
  }
}

// Comprehensive function to get all alerts from all sources
export async function getAllAlerts(zip: string, lat: number, lon: number, state: string | null) {
  console.log('[getAllAlerts] ===== STARTING COMPREHENSIVE ALERT FETCH =====');
  console.log('[getAllAlerts] Parameters:', { zip, lat, lon, state });
  
  const results = {
    openWeatherMap: [] as any[],
    nws: [] as any[],
    fema: [] as any[]
  };

  console.log('[getAllAlerts] Fetching from all 3 sources in parallel...');
  
  // Fetch all sources in parallel
  const [owmResult, nwsResult, femaResult] = await Promise.allSettled([
    getOpenWeatherMapAlerts(lat, lon),
    getNwsAlertsByLatLon(lat, lon),
    state ? getFemaDisastersByState(state) : Promise.resolve([])
  ]);

  console.log('[getAllAlerts] All requests completed. Processing results...');

  if (owmResult.status === 'fulfilled') {
    results.openWeatherMap = owmResult.value || [];
    console.log(`[getAllAlerts] ✅ OpenWeatherMap: ${results.openWeatherMap.length} alerts`);
  } else {
    console.error('[getAllAlerts] ❌ OpenWeatherMap error:', owmResult.reason);
  }

  if (nwsResult.status === 'fulfilled') {
    results.nws = nwsResult.value || [];
    console.log(`[getAllAlerts] ✅ NWS: ${results.nws.length} alerts`);
  } else {
    console.error('[getAllAlerts] ❌ NWS error:', nwsResult.reason);
  }

  if (femaResult.status === 'fulfilled') {
    results.fema = femaResult.value || [];
    console.log(`[getAllAlerts] ✅ FEMA: ${results.fema.length} disasters`);
  } else {
    console.error('[getAllAlerts] ❌ FEMA error:', femaResult.reason);
  }

  const totalAlerts = results.openWeatherMap.length + results.nws.length + results.fema.length;
  console.log(`[getAllAlerts] ===== TOTAL ALERTS: ${totalAlerts} =====`);
  console.log('[getAllAlerts] Summary:', {
    openWeatherMap: results.openWeatherMap.length,
    nws: results.nws.length,
    fema: results.fema.length,
    total: totalAlerts
  });

  return results;
}
 