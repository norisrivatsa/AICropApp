"use client";

import { useMemo, useState } from "react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ChatWindow } from "@/components/ChatWindow";
import { Composer } from "@/components/Composer";
import { CropCards } from "@/components/CropCards";
import { LanguageToggle } from "@/components/LanguageToggle";
import { LocationButton } from "@/components/LocationButton";
import { UploadPhotoButton } from "@/components/UploadPhotoButton";
import { DEFAULT_PROFILE } from "@/lib/constants";
import { startTranscribeStreaming } from "@/lib/aws/transcribeStreaming";
import { getOrCreateSessionId } from "@/lib/session";
import { ChatMessage, ChatResponse, LangCode, LocationInput } from "@/lib/types";
import { uid } from "@/lib/utils";

const TRANSCRIBE_REGION = process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1";
const IDENTITY_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || "";

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [partial, setPartial] = useState("");
  const [cards, setCards] = useState<ChatResponse["cards"]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<LangCode>("en-IN");
  const [error, setError] = useState<string>("");
  const [location, setLocation] = useState<LocationInput | undefined>();
  const [locationLabel, setLocationLabel] = useState<string>("Not shared");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [latestAudio, setLatestAudio] = useState<string>("");

  const composedInput = useMemo(() => (partial ? `${text}${text ? " " : ""}${partial}` : text), [text, partial]);
  const [stopStream, setStopStream] = useState<null | (() => Promise<void>)>(null);

  async function sendMessage(messageText?: string) {
    const finalText = (messageText ?? composedInput).trim();
    if (!finalText) return;

    const sessionId = getOrCreateSessionId();
    setError("");
    setIsSending(true);

    const userMessage: ChatMessage = { id: uid(), role: "user", text: finalText };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: finalText,
          language,
          location,
          imageUrl,
          userProfile: DEFAULT_PROFILE
        })
      });

      if (!response.ok) throw new Error("Failed to get response from advisor");
      const data = (await response.json()) as ChatResponse;

      setCards(data.cards);
      setLatestAudio(data.audio?.base64 || "");
      setLocationLabel(data.locationContext.state
        ? `${data.locationContext.district || ""} ${data.locationContext.state}`.trim()
        : locationLabel);

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          text: data.assistantText,
          cards: data.cards,
          audioBase64: data.audio?.base64
        }
      ]);

      setText("");
      setPartial("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error while sending message");
    } finally {
      setIsSending(false);
    }
  }

  async function toggleMic() {
    setError("");

    if (isRecording && stopStream) {
      await stopStream();
      setStopStream(null);
      setIsRecording(false);
      if (composedInput.trim()) {
        await sendMessage(composedInput);
      }
      return;
    }

    if (!IDENTITY_POOL_ID) {
      setError("Transcribe is not configured. Set NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID.");
      return;
    }

    try {
      const stop = await startTranscribeStreaming({
        languageCode: language,
        region: TRANSCRIBE_REGION,
        identityPoolId: IDENTITY_POOL_ID,
        onPartialTranscript: (t) => setPartial(t),
        onFinalTranscript: (t) => {
          setText((prev) => `${prev} ${t}`.trim());
          setPartial("");
        },
        onError: (msg) => setError(msg)
      });
      setStopStream(() => stop);
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone failed");
    }
  }

  function shareLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationLabel(`Lat ${position.coords.latitude.toFixed(4)}, Lng ${position.coords.longitude.toFixed(4)}`);
      },
      (err) => setError(`Location error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function uploadPhoto(file: File) {
    setError("");
    try {
      const resp = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type })
      });
      if (!resp.ok) throw new Error("Unable to get upload URL");
      const { uploadUrl, fileUrl } = await resp.json();

      const uploadResp = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });
      if (!uploadResp.ok) throw new Error("Upload failed");

      setImageUrl(fileUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    }
  }

  return (
    <main className="page">
      <header>
        <h1>Crop Advisor</h1>
      </header>

      <section className="actions">
        <LanguageToggle language={language} onChange={setLanguage} />
        <LocationButton onClick={shareLocation} disabled={isSending} />
        <UploadPhotoButton onSelect={uploadPhoto} disabled={isSending} />
      </section>

      <p className="meta">Location: {locationLabel}</p>
      {imageUrl ? <p className="meta">Image uploaded.</p> : null}

      <ChatWindow messages={messages} />
      <CropCards cards={cards} />
      <AudioPlayer audioBase64={latestAudio} />

      {error ? <p className="error">{error}</p> : null}

      <Composer
        value={composedInput}
        onChange={(v) => {
          setText(v);
          setPartial("");
        }}
        onSend={() => sendMessage()}
        isSending={isSending}
        isRecording={isRecording}
        onMicToggle={toggleMic}
      />
    </main>
  );
}
