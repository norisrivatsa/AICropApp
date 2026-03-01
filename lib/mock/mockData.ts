import { ChatResponse } from "@/lib/types";

export const MOCK_CHAT_RESPONSE: ChatResponse = {
  sessionId: "mock-session",
  assistantText:
    "Top options for your profile are Wheat, Mustard, and Gram. Wheat suits medium irrigation and current season. Mustard adds lower water risk. Gram helps rotation and can reduce input cost. This is decision support; consult local KVK/agronomist.",
  cards: [
    {
      crop: "Wheat",
      suitabilityScore: 84,
      profitRangeInrPerAcre: "25000-42000",
      waterNeed: "medium",
      risk: "low",
      confidence: "high",
      why: ["Strong rabi fit", "Budget compatible", "Stable market demand"]
    },
    {
      crop: "Mustard",
      suitabilityScore: 78,
      profitRangeInrPerAcre: "22000-38000",
      waterNeed: "low",
      risk: "medium",
      confidence: "medium",
      why: ["Lower irrigation need", "Good oilseed demand", "Useful for diversification"]
    },
    {
      crop: "Gram",
      suitabilityScore: 74,
      profitRangeInrPerAcre: "18000-32000",
      waterNeed: "low",
      risk: "medium",
      confidence: "medium",
      why: ["Lower input requirement", "Pulse demand", "Supports rotation health"]
    }
  ],
  locationContext: {
    district: "Lucknow",
    state: "Uttar Pradesh",
    country: "India"
  },
  meta: {
    season: "rabi",
    disclaimer: "This is decision support; consult local KVK/agronomist."
  },
  audio: {
    contentType: "audio/mpeg",
    base64: ""
  }
};
