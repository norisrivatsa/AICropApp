import { CropCard } from "@/lib/types";

export function CropCards({ cards }: { cards: CropCard[] }) {
  if (!cards.length) return null;

  return (
    <div className="cardsGrid">
      {cards.map((card) => (
        <div key={card.crop} className="cropCard">
          <h3>{card.crop}</h3>
          <p><strong>Score:</strong> {card.suitabilityScore}</p>
          <p><strong>Profit (INR/acre):</strong> {card.profitRangeInrPerAcre}</p>
          <p><strong>Water:</strong> {card.waterNeed}</p>
          <p><strong>Risk:</strong> {card.risk}</p>
          <p><strong>Confidence:</strong> {card.confidence}</p>
          <ul>
            {card.why.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
