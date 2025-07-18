
import { Loader } from '@googlemaps/js-api-loader';

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

export interface Location {
  lat: number;
  lng: number;
}

export interface PlaceResult {
  name: string;
  address: string;
  location: Location;
  distance?: number;
  phone?: string;
  rating?: number;
}

// Singleton class to manage Google Maps services
export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private loader: Loader;
  private geocoder: google.maps.Geocoder | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private map: google.maps.Map | null = null; // Keep a single map instance

  private constructor() {
    this.loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geocoding', 'marker'], // Include 'marker' for AdvancedMarkerElement
    });
  }

  static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  async load(): Promise<void> {
    try {
      await this.loader.load();
      // Create a single, non-visible map instance to provide context for services
      const tempDiv = document.createElement('div');
      this.map = new google.maps.Map(tempDiv);
      this.geocoder = new google.maps.Geocoder();
      this.placesService = new google.maps.places.PlacesService(this.map);
    } catch (e) {
      console.error("Error loading Google Maps API:", e);
      throw e;
    }
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation is not supported'));
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  async geocodeZipCode(zipCode: string): Promise<Location | null> {
    if (!this.geocoder) throw new Error("Geocoder not initialized");
    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({ componentRestrictions: { country: 'US', postalCode: zipCode } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          reject(new Error(`Geocoding failed for ${zipCode}: ${status}`));
        }
      });
    });
  }

  async reverseGeocode(location: Location): Promise<any | null> {
    if (!this.geocoder) throw new Error("Geocoder not initialized");
    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({ location }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          // Find the state from the address components
          const stateComponent = results[0].address_components.find(c => c.types.includes('administrative_area_level_1'));
          resolve({
            fullAddress: results[0].formatted_address,
            state: stateComponent ? stateComponent.short_name : null,
          });
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }

  async findNearbyPlaces(location: Location, type: string, radius: number = 5000): Promise<PlaceResult[]> {
    if (!this.placesService) throw new Error("Places service not initialized");
    return new Promise((resolve) => {
      this.placesService!.nearbySearch({ location, radius, type }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results.map(p => this.formatPlaceResult(p)).filter(p => p !== null) as PlaceResult[]);
        } else {
          resolve([]);
        }
      });
    });
  }

  async textSearch(location: Location, query: string, radius: number = 10000): Promise<PlaceResult[]> {
    if (!this.placesService) throw new Error("Places service not initialized");
    return new Promise((resolve) => {
      this.placesService!.textSearch({ query, location, radius }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results.map(p => this.formatPlaceResult(p)).filter(p => p !== null) as PlaceResult[]);
        } else {
          resolve([]);
        }
      });
    });
  }

  private formatPlaceResult(place: google.maps.places.PlaceResult): PlaceResult | null {
    if (!place.name || !place.geometry?.location) return null;
    return {
      name: place.name,
      address: place.vicinity || place.formatted_address || 'Address not available',
      location: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      },
      phone: place.formatted_phone_number,
      rating: place.rating,
    };
  }

  calculateDistance(from: Location, to: Location): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  openDirections(destination: Location): void {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
    window.open(url, '_blank');
  }
}
