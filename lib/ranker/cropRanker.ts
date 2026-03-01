import { clamp } from "@/lib/utils";
import { CropCard, IrrigationLevel, Season } from "@/lib/types";
import { CROPS, irrigationSupportsCrop } from "@/lib/ranker/crops";

interface RankInput {
  state?: string;
  season: Season;
  landAreaAcres: number;
  budgetInr: number;
  irrigation: IrrigationLevel;
}

const WEIGHTS = {
  water: 0.25,
  climate: 0.25,
  profitability: 0.25,
  budget: 0.15,
  rotation: 0.1
};

function scoreToConfidence(score: number): "high" | "medium" | "low" {
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  return "low";
}

function scoreToRisk(rawRisk: "low" | "medium" | "high", irrigationFit: number): "low" | "medium" | "high" {
  if (irrigationFit < 40) return "high";
  if (irrigationFit < 65) return "medium";
  return rawRisk;
}

function profitabilityScore(minProfit: number, maxProfit: number, landAreaAcres: number): number {
  const meanPerAcre = (minProfit + maxProfit) / 2;
  const total = meanPerAcre * Math.max(landAreaAcres, 1);
  if (total >= 100000) return 90;
  if (total >= 70000) return 75;
  if (total >= 45000) return 62;
  return 50;
}

export function rankCrops(input: RankInput): CropCard[] {
  const cards = CROPS.map((crop) => {
    const water = irrigationSupportsCrop(input.irrigation, crop.waterNeed);
    const climateSeason = crop.suitedSeasons.includes(input.season) ? 95 : 35;
    const climateState = input.state && crop.zones.includes(input.state) ? 92 : 65;
    const climate = Math.round((climateSeason * 0.7) + (climateState * 0.3));

    const profitability = profitabilityScore(crop.baseProfitMin, crop.baseProfitMax, input.landAreaAcres);

    const budget = input.budgetInr >= crop.minBudget
      ? 90
      : clamp(Math.round((input.budgetInr / crop.minBudget) * 90), 15, 90);

    const rotation = crop.rotationScore;

    const total = Math.round(
      (water * WEIGHTS.water) +
      (climate * WEIGHTS.climate) +
      (profitability * WEIGHTS.profitability) +
      (budget * WEIGHTS.budget) +
      (rotation * WEIGHTS.rotation)
    );

    const why: string[] = [
      `${input.season.toUpperCase()} season fit: ${climateSeason >= 90 ? "strong" : "limited"}`,
      `Irrigation match: ${input.irrigation} for ${crop.waterNeed} water crop`,
      `Budget fit score: ${budget}/100`
    ];

    return {
      crop: crop.name,
      suitabilityScore: clamp(total, 0, 100),
      profitRangeInrPerAcre: `${crop.baseProfitMin}-${crop.baseProfitMax}`,
      waterNeed: crop.waterNeed,
      risk: scoreToRisk(crop.baseRisk, water),
      confidence: scoreToConfidence(total),
      why
    } as CropCard;
  });

  return cards.sort((a, b) => b.suitabilityScore - a.suitabilityScore).slice(0, 3);
}
