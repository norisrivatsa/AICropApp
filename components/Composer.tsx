import { FormEvent } from "react";
import { MicButton } from "@/components/MicButton";

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isSending: boolean;
  isRecording: boolean;
  onMicToggle: () => void;
}

export function Composer({ value, onChange, onSend, isSending, isRecording, onMicToggle }: ComposerProps) {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isSending) return;
    onSend();
  };

  return (
    <form className="composer" onSubmit={onSubmit}>
      <MicButton isRecording={isRecording} onToggle={onMicToggle} disabled={isSending} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask about crops, season, water, budget..."
      />
      <button type="submit" disabled={isSending || !value.trim()}>
        Send
      </button>
    </form>
  );
}
