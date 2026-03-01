import { LangCode } from "@/lib/types";

export const DISCLAIMER = "This is decision support; consult local KVK/agronomist.";

export const DEFAULT_PROFILE = {
  landAreaAcres: 2,
  budgetInr: 50000,
  irrigation: "medium" as const
};

export const LANGUAGE_TO_POLLY_VOICE: Record<LangCode, string> = {
  "en-IN": "Kajal",
  "hi-IN": "Kajal"
};

export const LANGUAGE_TO_TRANSCRIBE: Record<LangCode, string> = {
  "en-IN": "en-IN",
  "hi-IN": "hi-IN"
};
