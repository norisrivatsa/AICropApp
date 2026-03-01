import { PollyClient, SynthesizeSpeechCommand, VoiceId } from "@aws-sdk/client-polly";
import { awsConfig } from "@/lib/aws/config";
import { LANGUAGE_TO_POLLY_VOICE } from "@/lib/constants";
import { LangCode } from "@/lib/types";

const pollyClient = new PollyClient({ region: awsConfig.region });

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export async function synthesizeSpeechBase64(text: string, language: LangCode): Promise<string> {
  const voiceId = LANGUAGE_TO_POLLY_VOICE[language] as VoiceId;
  const output = await pollyClient.send(
    new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: voiceId,
      Engine: "standard"
    })
  );

  if (!output.AudioStream) return "";
  const chunk = await output.AudioStream.transformToByteArray();
  return bytesToBase64(chunk);
}
