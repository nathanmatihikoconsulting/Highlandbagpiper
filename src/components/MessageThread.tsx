import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return time;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${time}`;
}

interface Props {
  bookingId: Id<"bookings">;
}

export function MessageThread({ bookingId }: Props) {
  const messages = useQuery(api.messages.getMessages, { bookingId });
  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.messages.markMessagesRead);

  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mark incoming messages as read whenever the thread is open or new messages arrive
  useEffect(() => {
    markRead({ bookingId });
  }, [messages?.length, bookingId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await sendMessage({ bookingId, content: trimmed });
      setContent("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t mt-4 pt-4">
      {/* Message list */}
      <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1 mb-3">
        {messages === undefined ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No messages yet. Start the conversation below.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex flex-col max-w-[80%] ${msg.isOwn ? "self-end items-end" : "self-start items-start"}`}
            >
              {!msg.isOwn && (
                <span className="text-xs text-muted-foreground mb-1 px-1">{msg.senderName}</span>
              )}
              <div
                className={`px-3 py-2 rounded-lg text-sm leading-relaxed ${
                  msg.isOwn
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-white border border-border text-charcoal rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-xs text-muted-foreground mt-1 px-1">
                {formatTime(msg.createdAt)}
                {msg.isOwn && msg.readAt && (
                  <span className="ml-1 opacity-60">· Read</span>
                )}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compose area */}
      <div className="flex gap-2 items-end">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          className="resize-none min-h-[40px] max-h-32 text-sm bg-white"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className="bg-primary hover:bg-primary-hover text-white flex-shrink-0"
          size="sm"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
