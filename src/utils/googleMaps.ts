
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBtNkwIOuJ6GATeMJHdOtlfIPDKwWAEzvg';

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
  private map: google.maps.Map | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private geocoder: google.maps.Geocoder | null = null;

  static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  async initializeMap(elementId: string, center: Location, zoom: number = 12): Promise<google.maps.Map> {
    const mapElement = document.getElementById(elementId);
    if (!mapElement) throw new Error(`Element with id ${elementId} not found`);

    this.map = new (window as any).google.maps.Map(mapElement, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    this.placesService = new (window as any).google.maps.places.PlacesService(this.map);
    this.geocoder = new (window as any).google.maps.Geocoder();

    return this.map;
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  async geocodeZipCode(zipCode: string): Promise<Location> {
    if (!this.geocoder) {
      this.geocoder = new (window as any).google.maps.Geocoder();
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({ address: zipCode }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          reject(new Error('Geocoding failed'));
        }
      });
    });
  }

  async findNearbyPlaces(location: Location, type: string, radius: number = 5000): Promise<PlaceResult[]> {
    if (!this.placesService) {
      throw new Error('Places service not initialized');
    }

    return new Promise((resolve, reject) => {
      const request = {
        location: new (window as any).google.maps.LatLng(location.lat, location.lng),
        radius,
        type: type as any,
      };

      this.placesService!.nearbySearch(request, (results: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
          const places: PlaceResult[] = results.map((place: any) => ({
            name: place.name || 'Unknown',
            address: place.vicinity || 'Address not available',
            location: {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
            },
            phone: place.formatted_phone_number,
            rating: place.rating,
          }));
          resolve(places);
        } else {
          reject(new Error('Places search failed'));
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

  addMarker(location: Location, title?: string, icon?: string): google.maps.Marker | null {
    if (!this.map) return null;

    return new (window as any).google.maps.Marker({
      position: location,
      map: this.map,
      title,
      icon,
    });
  }

  openDirections(destination: Location): void {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
    window.open(url, '_blank');
  }
}
