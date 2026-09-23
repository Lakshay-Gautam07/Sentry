export interface SafetyAssessment {
  level: 'Normal' | 'Caution' | 'Warning';
  note: string;
}

export interface AiSummaryData {
  overview: string;
  safetyAssessment: SafetyAssessment;
  weatherOutlook: string;
  recentDevelopments: string;
  travelAdvice: string[];
  sourcesUsed: {
    weather: boolean;
    alerts: boolean;
    news: boolean;
  };
  generatedAt: string;
}

export interface SummaryResponse {
  success: boolean;
  destination: string;
  country?: string;
  summary: AiSummaryData;
  fromDatabase: boolean;
  message?: string;
}
