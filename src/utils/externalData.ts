
// Utility for weather and disaster data

const OPENWEATHERMAP_API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
const OPENWEATHERMAP_BASE = 'https://api.openweathermap.org/data/2.5';
const FEMA_BASE = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries';

export async function getWeatherByZip(zip: string) {
  if (!OPENWEATHERMAP_API_KEY || OPENWEATHERMAP_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY_HERE') {
    console.error("FATAL: OpenWeatherMap API key is missing or is a placeholder. Please add your key to the .env file and restart the server.");
    throw new Error('Missing OpenWeatherMap API Key');
  }

  const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/zip?zip=${zip},US&appid=${OPENWEATHERMAP_API_KEY}`);
  if (!geoRes.ok) throw new Error('Failed to get location for ZIP');
  const geo = await geoRes.json();
  const { lat, lon } = geo;

  const weatherRes = await fetch(`${OPENWEATHERMAP_BASE}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=imperial`);
  if (!weatherRes.ok) throw new Error('Failed to fetch current weather');
  const weather = await weatherRes.json();

  const forecastRes = await fetch(`${OPENWEATHERMAP_BASE}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=imperial`);
  if (!forecastRes.ok) throw new Error('Failed to fetch forecast');
  const forecastData = await forecastRes.json();

  return {
    geo,
    weather,
    forecast: forecastData.list || [],
    alerts: [] 
  };
}

export async function getFemaDisastersByState(state: string) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const res = await fetch(`${FEMA_BASE}?$filter=state eq '${state}' and declarationDate ge '${oneWeekAgo}'&$orderby=declarationDate desc&$top=10`);
  if (!res.ok) {
    console.error(`FEMA API request failed with status ${res.status}`);
    throw new Error('Failed to fetch FEMA disasters');
  }
  const data = await res.json();
  return data.DisasterDeclarationsSummaries || [];
}

export async function getNwsAlertsByLatLon(lat: number, lon: number) {
  const url = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'DisasterReadyApp/1.0' } });
  if (!res.ok) throw new Error('Failed to fetch NWS alerts');
  const data = await res.json();
  return (data.features || []).map((feature: any) => ({
    event: feature.properties.event,
    description: feature.properties.description,
    severity: feature.properties.severity,
    start: new Date(feature.properties.onset || feature.properties.effective).getTime() / 1000,
    end: new Date(feature.properties.ends || feature.properties.expires).getTime() / 1000,
    sender: feature.properties.senderName,
    id: feature.id
  }));
}

export async function getAIAssessment(weatherData: any) {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.error("Gemini API key not found or is a placeholder. Please check your .env file.");
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `
    Analyze the following weather data and provide a risk assessment for a disaster preparedness app.
    The data includes current weather, 5-day forecast, and active alerts.

    Data:
    - Current Weather: ${JSON.stringify(weatherData.weather)}
    - 5-Day Forecast: ${JSON.stringify(weatherData.forecast)}
    - Active Alerts: ${JSON.stringify(weatherData.alerts)}

    Based on this data, provide ONLY a raw JSON object (no markdown formatting) with the following structure:
    {
      "level": "low" | "medium" | "high" | "severe",
      "message": "A concise, descriptive message about the primary risk.",
      "recommendation": "A clear, actionable recommendation for the user.",
      "source": "AI Analysis"
    }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const data = await response.json();
    let content = data.candidates[0].content.parts[0].text;
    
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = content.match(jsonRegex);
if (match && match[1]) {
  content = match[1];
}


    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching or parsing AI assessment:', error);
    return null;
  }
}

 