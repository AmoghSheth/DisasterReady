# DisasterReady

A comprehensive disaster preparedness application built with React, TypeScript, and Vite. This app helps users prepare for and respond to natural disasters with real-time weather alerts, risk assessments, emergency planning, and resource mapping.

## Features

- **Real-time Weather & Alerts**: Integration with OpenWeatherMap and National Weather Service for current conditions and active alerts
- **Risk Assessment**: Local risk analysis based on weather conditions, alerts, and forecast data
- **Emergency Planning**: Customizable preparedness plans for earthquakes, floods, wildfires, and hurricanes
- **Interactive Maps**: Find nearby shelters, medical facilities, and evacuation routes using Google Maps
- **Household Management**: Track supplies, pets, and medical needs for your household
- **Emergency Contacts**: Store and manage important contact information
- **Offline-First**: All user data stored locally using localStorage

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Authentication**: Local storage-based auth system (no backend required)
- **Data Storage**: Browser localStorage for all user data
- **External APIs**:
  - OpenWeatherMap (weather data)
  - National Weather Service (official alerts)
  - Google Maps API (geocoding & places)
  - FEMA API (disaster declarations)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API keys for:
  - OpenWeatherMap (free tier available)
  - Google Maps API (requires billing enabled)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your API keys:
   ```
   VITE_OPENWEATHERMAP_API_KEY=your_key_here
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
npm run preview
```

## Architecture

### Authentication System

The app uses a local storage-based authentication system (`/src/lib/localAuth.ts`) instead of a backend service. This provides:
- Fully client-side operation
- No server costs or complexity
- Fast development and testing
- Offline capability

**Security Note**: This approach stores passwords in plain text in localStorage. For production use with real users, implement a proper backend with hashed passwords, HTTPS, and secure session tokens.

### Data Storage

All data is stored in browser localStorage using these keys:
- `disasterready_users` - Registered user accounts
- `disasterready_current_user` - Currently logged in user session
- `disasterready_profiles` - User profiles (location, household info)
- `disasterready_contacts` - Emergency contacts
- `household_supplies` - Supply inventory

### Key Components

- **AuthContext** (`/src/contexts/AuthContext.tsx`): Manages authentication state
- **ProtectedRoute** (`/src/components/ProtectedRoute.tsx`): Route guard for authenticated pages
- **External Data** (`/src/utils/externalData.ts`): API integrations for weather and alerts
- **Risk Assessment** (`/src/utils/riskAssessment.ts`): Local risk calculation logic
- **Google Maps Service** (`/src/utils/googleMaps.ts`): Singleton service for Maps API

## API Security

### Current Setup
- API keys are stored in environment variables and exposed client-side
- This is typical for browser apps but requires proper restrictions:

### Recommendations
1. **OpenWeatherMap**: Restrict key by HTTP referrer in your OWM dashboard
2. **Google Maps**: Enable referrer restrictions and set billing limits
3. **Rate Limiting**: Implement request debouncing/throttling in the app
4. **Production**: Consider proxying API calls through serverless functions to hide keys

## Development Notes

- The app previously used Supabase but has been fully migrated to local storage
- AI-based risk assessment (Gemini) is currently disabled client-side to avoid exposing API keys
- Emergency contact management uses local storage instead of a database

## Contributing

This is a demonstration/portfolio project. Feel free to fork and modify for your needs.

## License

MIT
