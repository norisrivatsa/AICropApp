import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { DISCLAIMER } from "@/lib/constants";
import { awsConfig } from "@/lib/aws/config";
import { CropCard, LangCode, LocationContext, Season } from "@/lib/types";

const bedrockClient = new BedrockRuntimeClient({ region: awsConfig.region });

export async function generateAdvisorText(input: {
  userMessage: string;
  language: LangCode;
  locationContext: LocationContext;
  cards: CropCard[];
  season: Season;
}): Promise<string> {
  const langInstruction = input.language === "hi-IN"
    ? "Reply in simple Hindi with occasional English crop terms where needed."
    : "Reply in simple English.";

  const prompt = [
    "You are Crop Advisor for North India.",
    langInstruction,
    "Never guarantee outcomes. Use only provided ranked crops JSON.",
    `Always include this exact line once: ${DISCLAIMER}`,
    "Explain why top crops are suggested and give a short 2-4 week sowing/action plan.",
    `User message: ${input.userMessage}`,
    `Location context: ${JSON.stringify(input.locationContext)}`,
    `Season: ${input.season}`,
    `Ranked crops: ${JSON.stringify(input.cards)}`
  ].join("\n");

  const response = await bedrockClient.send(
    new ConverseCommand({
      modelId: awsConfig.bedrockModelId,
      messages: [{ role: "user", content: [{ text: prompt }] }]
    })
  );

  const text = response.output?.message?.content?.[0]?.text;
  return text || `${input.cards[0]?.crop || "Wheat"} is currently suitable. ${DISCLAIMER}`;
}
