export function UploadPhotoButton({ onSelect, disabled }: { onSelect: (file: File) => void; disabled?: boolean }) {
  return (
    <label className={`secondaryButton ${disabled ? "disabled" : ""}`}>
      Upload Photo
      <input
        type="file"
        accept="image/*"
        hidden
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.currentTarget.value = "";
        }}
      />
    </label>
  );
}
