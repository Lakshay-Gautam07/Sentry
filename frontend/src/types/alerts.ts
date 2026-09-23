export interface Alert {
  id: string;
  title: string;
  type: string;
  severity: string | null;
  severityScore: number;
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  fromDate: string | null;
  toDate: string | null;
  source: string;
  link: string;
}

export interface AlertsSourceInfo {
  count: number;
  error: string | null;
}

export interface AlertsSachetInfo extends AlertsSourceInfo {
  used: boolean;
}

export interface AlertsResponse {
  success: boolean;
  country: string;
  isIndia: boolean;
  count: number;
  alerts: Alert[];
  sources: {
    gdacs: AlertsSourceInfo;
    sachet: AlertsSachetInfo;
  };
  message?: string;
}
