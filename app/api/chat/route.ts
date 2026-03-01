import { NextRequest, NextResponse } from "next/server";
import { generateAdvisorText } from "@/lib/aws/bedrock";
import { reverseGeocode } from "@/lib/aws/location";
import { synthesizeSpeechBase64 } from "@/lib/aws/polly";
import { DISCLAIMER, DEFAULT_PROFILE } from "@/lib/constants";
import { isMockMode } from "@/lib/mock/mockMode";
import { MOCK_CHAT_RESPONSE } from "@/lib/mock/mockData";
import { rankCrops } from "@/lib/ranker/cropRanker";
import { inferSeason } from "@/lib/ranker/season";
import { ChatRequest, ChatResponse, IrrigationLevel, LocationContext } from "@/lib/types";
import { parseNumber } from "@/lib/utils";

export const runtime = "nodejs";

function normalizeIrrigation(value: unknown): IrrigationLevel {
  if (value === "low" || value === "medium" || value === "high") return value;
  return DEFAULT_PROFILE.irrigation;
}

function safeChatRequest(input: Partial<ChatRequest>): ChatRequest {
  return {
    sessionId: String(input.sessionId || "session-local"),
    message: String(input.message || ""),
    language: input.language === "hi-IN" ? "hi-IN" : "en-IN",
    location: input.location,
    imageUrl: input.imageUrl,
    userProfile: {
      landAreaAcres: parseNumber(input.userProfile?.landAreaAcres, DEFAULT_PROFILE.landAreaAcres),
      budgetInr: parseNumber(input.userProfile?.budgetInr, DEFAULT_PROFILE.budgetInr),
      irrigation: normalizeIrrigation(input.userProfile?.irrigation)
    }
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<ChatRequest>;
    const input = safeChatRequest(body);

    if (!input.message.trim()) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    if (isMockMode()) {
      return NextResponse.json({
        ...MOCK_CHAT_RESPONSE,
        sessionId: input.sessionId
      } satisfies ChatResponse);
    }

    let locationContext: LocationContext = {};
    if (input.location?.lat !== undefined && input.location?.lng !== undefined) {
      locationContext = await reverseGeocode(input.location.lat, input.location.lng);
    }

    const season = inferSeason();
    const cards = rankCrops({
      state: locationContext.state,
      season,
      landAreaAcres: input.userProfile.landAreaAcres,
      budgetInr: input.userProfile.budgetInr,
      irrigation: input.userProfile.irrigation
    });

    const assistantText = await generateAdvisorText({
      userMessage: input.message,
      language: input.language,
      cards,
      season,
      locationContext
    });

    const audioBase64 = await synthesizeSpeechBase64(assistantText, input.language);

    const response: ChatResponse = {
      sessionId: input.sessionId,
      assistantText,
      cards,
      locationContext,
      audio: audioBase64
        ? {
          contentType: "audio/mpeg",
          base64: audioBase64
        }
        : undefined,
      meta: {
        season,
        disclaimer: DISCLAIMER
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      {
        sessionId: "",
        assistantText: `Unable to process request right now. ${DISCLAIMER}`,
        cards: [],
        locationContext: {},
        meta: {
          season: inferSeason(),
          disclaimer: DISCLAIMER
        },
        error: message
      },
      { status: 500 }
    );
  }
}
