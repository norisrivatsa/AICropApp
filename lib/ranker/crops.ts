import { IrrigationLevel, Season, WaterNeed } from "@/lib/types";

export interface CropDef {
  name: string;
  suitedSeasons: Season[];
  zones: string[];
  waterNeed: WaterNeed;
  minBudget: number;
  baseProfitMin: number;
  baseProfitMax: number;
  rotationScore: number;
  baseRisk: "low" | "medium" | "high";
}

export const NORTH_INDIA_STATES = [
  "Punjab",
  "Haryana",
  "Uttar Pradesh",
  "Uttarakhand",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Delhi",
  "Rajasthan",
  "Bihar"
];

export const CROPS: CropDef[] = [
  {
    name: "Wheat",
    suitedSeasons: ["rabi"],
    zones: NORTH_INDIA_STATES,
    waterNeed: "medium",
    minBudget: 30000,
    baseProfitMin: 25000,
    baseProfitMax: 42000,
    rotationScore: 65,
    baseRisk: "low"
  },
  {
    name: "Paddy",
    suitedSeasons: ["kharif"],
    zones: ["Punjab", "Haryana", "Uttar Pradesh", "Bihar", "Uttarakhand"],
    waterNeed: "high",
    minBudget: 45000,
    baseProfitMin: 28000,
    baseProfitMax: 52000,
    rotationScore: 40,
    baseRisk: "medium"
  },
  {
    name: "Mustard",
    suitedSeasons: ["rabi"],
    zones: ["Rajasthan", "Haryana", "Uttar Pradesh", "Delhi", "Punjab"],
    waterNeed: "low",
    minBudget: 22000,
    baseProfitMin: 22000,
    baseProfitMax: 38000,
    rotationScore: 75,
    baseRisk: "medium"
  },
  {
    name: "Maize",
    suitedSeasons: ["kharif", "zaid"],
    zones: ["Bihar", "Uttar Pradesh", "Punjab", "Himachal Pradesh", "Uttarakhand"],
    waterNeed: "medium",
    minBudget: 26000,
    baseProfitMin: 20000,
    baseProfitMax: 36000,
    rotationScore: 70,
    baseRisk: "medium"
  },
  {
    name: "Gram",
    suitedSeasons: ["rabi"],
    zones: ["Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Bihar", "Haryana"],
    waterNeed: "low",
    minBudget: 18000,
    baseProfitMin: 18000,
    baseProfitMax: 32000,
    rotationScore: 85,
    baseRisk: "low"
  },
  {
    name: "Sugarcane",
    suitedSeasons: ["kharif", "zaid"],
    zones: ["Uttar Pradesh", "Haryana", "Punjab", "Bihar", "Uttarakhand"],
    waterNeed: "high",
    minBudget: 60000,
    baseProfitMin: 45000,
    baseProfitMax: 75000,
    rotationScore: 35,
    baseRisk: "high"
  }
];

export function irrigationSupportsCrop(irrigation: IrrigationLevel, waterNeed: WaterNeed): number {
  if (irrigation === "high") return waterNeed === "high" ? 100 : 85;
  if (irrigation === "medium") {
    if (waterNeed === "medium") return 95;
    if (waterNeed === "low") return 90;
    return 45;
  }
  if (waterNeed === "low") return 95;
  if (waterNeed === "medium") return 50;
  return 20;
}
