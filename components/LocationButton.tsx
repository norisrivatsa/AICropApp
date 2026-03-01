export function LocationButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" className="secondaryButton" onClick={onClick} disabled={disabled}>
      Share Location
    </button>
  );
}
