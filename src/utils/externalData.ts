// Utility for weather and disaster data

const OPENWEATHERMAP_API_KEY = 'b64735110700e0bc29c407fcd5e4b6e1';
const OPENWEATHERMAP_BASE = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHERMAP_ONECALL = 'https://api.openweathermap.org/data/3.0/onecall';
const FEMA_BASE = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries';

export async function getWeatherByZip(zip: string) {
  // Get lat/lon for zip
  const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/zip?zip=${zip},US&appid=${OPENWEATHERMAP_API_KEY}`);
  if (!geoRes.ok) throw new Error('Failed to get location for ZIP');
  const geo = await geoRes.json();
  const { lat, lon } = geo;

  // Get current weather
  const weatherRes = await fetch(`${OPENWEATHERMAP_BASE}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=imperial`);
  const weather = await weatherRes.json();

  // Get 7-day forecast and alerts
  const oneCallRes = await fetch(`${OPENWEATHERMAP_ONECALL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=imperial&exclude=minutely,hourly`);
  const oneCall = await oneCallRes.json();

  return {
    geo,
    weather,
    forecast: oneCall.daily,
    alerts: oneCall.alerts || []
  };
}

export async function getFemaDisastersByState(state: string) {
  // FEMA API returns recent disasters for a state
  const res = await fetch(`${FEMA_BASE}?state=${state}&$orderby=declarationDate desc&$top=5`);
  if (!res.ok) throw new Error('Failed to fetch FEMA disasters');
  const data = await res.json();
  return data.DisasterDeclarationsSummaries || [];
}

export async function getNwsAlertsByLatLon(lat: number, lon: number) {
  // NWS API: https://api.weather.gov/alerts?point={lat},{lon}
  const url = `https://api.weather.gov/alerts?point=${lat},${lon}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'DisasterReadyApp/1.0' } });
  if (!res.ok) throw new Error('Failed to fetch NWS alerts');
  const data = await res.json();
  // Normalize to similar structure as OWM alerts
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