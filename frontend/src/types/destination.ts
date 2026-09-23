export interface Destination {
  id: number;
  name: string;
  country: string | null;
  countryCode: string | null;
  region: string | null;
  latitude: number;
  longitude: number;
  timezone: string | null;
  elevation: number | null;
}

export interface DestinationSearchResponse {
  success: boolean;
  query: string;
  count: number;
  results: Destination[];
  message?: string;
}
