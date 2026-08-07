import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, User as UserIcon } from "lucide-react";
import * as repository from "@/data/engagementRepository";
import { useCustomer } from "@/lib/customerAuth";

/**
 * ChatSupport — floating chat widget for storefront visitors.
 * - Persists to LocalStorage per customer/session
 * - Auto-replies via keyword rules (see AUTO_ANSWERS in store.js)
 * - Positions to the LEFT so it doesn't collide with the mobile hamburger
 *   floating on the right
 */
export default function ChatSupport() {
  const { getChatTranscript, appendChat, getAutoReply } = repository;
  const { customer } = useCustomer();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState([]);
  const scrollRef = useRef(null);

  const chatKey = customer?.id || "anon";

  useEffect(() => {
    setMsgs(getChatTranscript(chatKey));
  }, [chatKey, open]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, msgs]);

  const send = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    appendChat(chatKey, { from: "customer", text: trimmed });
    setText("");
    // fake typing then auto-reply
    setTimeout(() => {
      appendChat(chatKey, { from: "bot", text: getAutoReply(trimmed) });
      setMsgs(getChatTranscript(chatKey));
    }, 500);
    setMsgs(getChatTranscript(chatKey));
  };

  return (
    <>
      {/* Floating button (bottom-LEFT so it doesn't overlap the nav hamburger) */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat support"}
        data-testid="chat-support-toggle"
        className="fixed bottom-5 left-5 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-glow grid place-items-center border border-white/10 hover:-translate-y-0.5 transition-transform"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Panel */}
      {open && (
        <aside
          role="dialog"
          aria-label="Chat support"
          className="fixed bottom-24 left-5 z-40 w-[calc(100vw-40px)] sm:w-[380px] max-w-sm h-[min(70vh,560px)] bg-bg-surface border border-line grain rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          data-testid="chat-support-panel"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-line bg-bg-elevated/50 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500/15 border border-emerald-500/40 grid place-items-center">
              <Bot className="h-4 w-4 text-emerald-300" />
            </div>
            <div>
              <div className="font-medium text-sm">Vyapar360 support</div>
              <div className="text-[11px] text-ink-muted flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Auto-reply · usually replies instantly
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" data-testid="chat-support-list">
            {msgs.length === 0 && (
              <div className="text-center text-sm text-ink-muted py-8">
                Say hi 👋 or ask about orders, timings, payments, or refunds.
              </div>
            )}
            {msgs.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.from === "customer" ? "justify-end" : "justify-start"}`}
                data-testid={`chat-msg-${m.from}`}
              >
                {m.from === "bot" && (
                  <div className="h-7 w-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 grid place-items-center flex-shrink-0">
                    <Bot className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    m.from === "customer"
                      ? "bg-brand text-white rounded-tr-sm"
                      : "bg-bg-elevated border border-line text-ink-primary rounded-tl-sm"
                  }`}
                >
                  {m.text}
                </div>
                {m.from === "customer" && (
                  <div className="h-7 w-7 rounded-full bg-brand-soft border border-brand/30 grid place-items-center flex-shrink-0">
                    <UserIcon className="h-3.5 w-3.5 text-brand" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={send} className="border-t border-line p-3 flex gap-2 bg-bg-elevated/40">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message…"
              className="input-field !py-2 flex-1 text-sm"
              data-testid="chat-input"
            />
            <button
              type="submit"
              className="h-10 w-10 grid place-items-center rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
              disabled={!text.trim()}
              data-testid="chat-send"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
