
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCOUApwzid4BeHZb3AE_sy8KILH0e0xkco';

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

export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private geocoder: google.maps.Geocoder | null = null;

  static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  private getGeocoder(): google.maps.Geocoder {
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }
    return this.geocoder;
  }

  async getCurrentLocation(): Promise<Location> {
    console.log('Getting current location...');
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('Got current location:', location);
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  async geocodeZipCode(zipCode: string): Promise<Location> {
    console.log('Geocoding ZIP code:', zipCode);
    
    const geocoder = this.getGeocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ 
        address: zipCode + ', USA',
        region: 'US'
      }, (results, status) => {
        console.log('Geocoding results:', { results, status });
        
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const result = {
            lat: location.lat(),
            lng: location.lng(),
          };
          console.log('Geocoded location:', result);
          resolve(result);
        } else {
          console.error('Geocoding failed:', status);
          reject(new Error('Geocoding failed: ' + status));
        }
      });
    });
  }

  async findNearbyPlaces(location: Location, type: string, radius: number = 5000): Promise<PlaceResult[]> {
    console.log('Finding nearby places:', { location, type, radius });
    
    // Create a temporary map for places service
    const tempDiv = document.createElement('div');
    const tempMap = new google.maps.Map(tempDiv, { center: location, zoom: 12 });
    const placesService = new google.maps.places.PlacesService(tempMap);

    return new Promise((resolve) => {
      const request = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type: type as any,
      };

      placesService.nearbySearch(request, (results, status) => {
        console.log('Places search results:', { results, status, type });
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: PlaceResult[] = results
            .filter((place: any) => place.business_status !== 'CLOSED_PERMANENTLY')
            .map((place: any) => ({
              name: place.name || 'Unknown',
              address: place.vicinity || 'Address not available',
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
              phone: place.formatted_phone_number,
              rating: place.rating,
            }));
          console.log('Processed places:', places);
          resolve(places);
        } else {
          console.error('Places search failed:', status);
          resolve([]);
        }
      });
    });
  }

  calculateDistance(from: Location, to: Location): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  openDirections(destination: Location): void {
    console.log('Opening directions to:', destination);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
    window.open(url, '_blank');
  }
}
