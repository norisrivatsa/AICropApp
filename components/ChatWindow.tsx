import { ChatMessage } from "@/lib/types";

export function ChatWindow({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="chatWindow">
      {messages.map((msg) => (
        <div key={msg.id} className={`bubbleRow ${msg.role}`}>
          <div className={`bubble ${msg.role}`}>{msg.text}</div>
        </div>
      ))}
    </div>
  );
}
