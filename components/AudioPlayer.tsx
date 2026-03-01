import { useEffect, useRef } from "react";

export function AudioPlayer({ audioBase64, contentType = "audio/mpeg" }: { audioBase64?: string; contentType?: string }) {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioBase64 || !ref.current) return;
    const src = `data:${contentType};base64,${audioBase64}`;
    ref.current.src = src;
    ref.current.play().catch(() => {
      // Autoplay can be blocked by browser policy.
    });
  }, [audioBase64, contentType]);

  if (!audioBase64) return null;

  return <audio ref={ref} controls className="audioPlayer" />;
}
