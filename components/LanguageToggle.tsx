import { LangCode } from "@/lib/types";

export function LanguageToggle({ language, onChange }: { language: LangCode; onChange: (l: LangCode) => void }) {
  return (
    <div className="langToggle" role="group" aria-label="Language">
      <button
        type="button"
        className={language === "en-IN" ? "active" : ""}
        onClick={() => onChange("en-IN")}
      >
        EN
      </button>
      <button
        type="button"
        className={language === "hi-IN" ? "active" : ""}
        onClick={() => onChange("hi-IN")}
      >
        HI
      </button>
    </div>
  );
}
