
import { toast } from 'sonner';

interface WeatherAlert {
  event: string;
  description: string;
  start: number;
  end: number;
  severity: string;
}

interface ForecastDay {
  weather: { main: string; description: string }[];
  temp: { day: number };
  wind_speed: number;
}

interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'severe';
  message: string;
  recommendation: string;
  source: string;
}

export const generateRiskAssessment = (
  alerts: WeatherAlert[],
  forecast: ForecastDay[]
): RiskAssessment | null => {
  if (!alerts && !forecast) {
    return null;
  }

  // Prioritize severe alerts
  const severeAlert = alerts?.find(a => a.severity?.toLowerCase() === 'high' || a.event.includes('Warning'));
  if (severeAlert) {
    let recommendation = 'Seek shelter immediately and monitor local news.';
    if (/tornado/i.test(severeAlert.event)) {
      recommendation = 'A tornado has been sighted. Take shelter now in a basement or interior room.';
    } else if (/flood/i.test(severeAlert.event)) {
      recommendation = 'Flash flooding is imminent. Move to higher ground immediately.';
    } else if (/fire/i.test(severeAlert.event)) {
      recommendation = 'A wildfire is approaching. Evacuate immediately if instructed to do so.';
    }
    
    // Trigger a dynamic notification for the severe alert
    toast.error(severeAlert.event, {
      description: recommendation,
      duration: 10000,
    });

    return {
      level: 'severe',
      message: `URGENT: ${severeAlert.event}`,
      recommendation,
      source: 'National Weather Service'
    };
  }

  // Analyze forecast for potential risks
  if (forecast && forecast.length > 0) {
    const today = forecast[0];
    if (today.wind_speed > 25) { // High winds
      return {
        level: 'high',
        message: 'High winds detected, increasing the risk of power outages.',
        recommendation: 'Secure outdoor furniture and prepare your emergency power sources.',
        source: 'Forecast Analysis'
      };
    }
    if (today.weather[0]?.main.includes('Thunderstorm')) {
      return {
        level: 'high',
        message: 'Thunderstorms expected, which may lead to localized flooding or power outages.',
        recommendation: 'Charge your devices and have a water-resistant emergency kit ready.',
        source: 'Forecast Analysis'
      };
    }
    if (today.temp.day > 95) { // Extreme heat
        return {
          level: 'medium',
          message: 'Extreme heat warning: Temperatures are dangerously high.',
          recommendation: 'Stay hydrated, avoid outdoor activities, and check on vulnerable neighbors.',
          source: 'Forecast Analysis'
        };
    }
  }

  // Check for other alerts
  if (alerts && alerts.length > 0) {
    const alert = alerts[0];
    return {
      level: 'medium',
      message: `Weather Advisory: ${alert.event}`,
      recommendation: 'Stay informed and review your preparedness plan for this type of event.',
      source: 'National Weather Service'
    };
  }

  return {
    level: 'low',
    message: 'No immediate threats detected. A great time to review your plan!',
    recommendation: 'Check your emergency kit supplies and ensure your contact list is up to date.',
    source: 'System Analysis'
  };
};
