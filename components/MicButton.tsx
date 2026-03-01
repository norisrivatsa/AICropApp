interface MicButtonProps {
  isRecording: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function MicButton({ isRecording, onToggle, disabled }: MicButtonProps) {
  return (
    <button
      type="button"
      className={`micButton ${isRecording ? "recording" : ""}`}
      onClick={onToggle}
      disabled={disabled}
      title={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording ? "Stop" : "Mic"}
    </button>
  );
}
