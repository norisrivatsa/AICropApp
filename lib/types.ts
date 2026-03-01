export type LangCode = "en-IN" | "hi-IN";

export type IrrigationLevel = "low" | "medium" | "high";
export type WaterNeed = "low" | "medium" | "high";
export type RiskLevel = "low" | "medium" | "high";
export type ConfidenceLevel = "low" | "medium" | "high";

export type Season = "kharif" | "rabi" | "zaid";

export interface LocationInput {
  lat: number;
  lng: number;
}

export interface LocationContext {
  district?: string;
  state?: string;
  country?: string;
}

export interface UserProfile {
  landAreaAcres: number;
  budgetInr: number;
  irrigation: IrrigationLevel;
}

export interface CropCard {
  crop: string;
  suitabilityScore: number;
  profitRangeInrPerAcre: string;
  waterNeed: WaterNeed;
  risk: RiskLevel;
  confidence: ConfidenceLevel;
  why: string[];
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  language: LangCode;
  userProfile: UserProfile;
  location?: LocationInput;
  imageUrl?: string;
}

export interface ChatResponse {
  sessionId: string;
  assistantText: string;
  cards: CropCard[];
  locationContext: LocationContext;
  audio?: {
    contentType: string;
    base64: string;
  };
  meta: {
    season: Season;
    disclaimer: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  cards?: CropCard[];
  audioBase64?: string;
}
