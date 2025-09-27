<div className="p-4 mb-4 rounded-xl bg-indigo-600 text-white">
  Tailwind is working 🎉
</div>


import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, ChevronDown } from "lucide-react";

// === Backend wiring ===
const DEV =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE =
  (import.meta.env && import.meta.env.VITE_AVA_API_URL) ||
  (DEV ? "http://localhost:8000/api" : "");

if (!API_BASE && !DEV) {
  console.error("VITE_AVA_API_URL is missing in production build.");
}

async function askBackend(query) {
  try {
    console.log("AVA API_BASE =", API_BASE);
    const r = await fetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.error("ASK non-OK:", r.status, txt);
      throw new Error(`HTTP ${r.status}`);
    }
    const j = await r.json();
    return (j && (j.answer || j.text)) || "Sorry, I couldn't find that in the menu.";
  } catch (e) {
    console.error("ASK error:", e);
    return "I couldn't reach the kitchen brain right now. Please try again in a moment.";
  }
}


/**
 * AVA AI — Mobile Web (Avocado theme, horizontal menu + specials)
 * - Name stays: AVA AI
 * - Neutral page background; avocado accents on buttons
 * - Header with avocado logo
 * - Horizontal MENU gallery with images; caption: name (left) + price (right)
 * - Chat box with horizontal chips for Today's Specials / Deal of the hour
 * - Simple static mock (no backend)
 */

/*********************
 * Avocado palette    *
 *********************/
const AVO = {
  peel: "#2E7D32",
  peelDark: "#1B5E20",
  flesh: "#81C784",
  pit: "#6D4C41",
};

/*********************
 * Avocado SVG Logo   *
 *********************/
const AvocadoSVG = ({ className = "h-9 w-9" }) => (
  <svg viewBox="0 0 128 128" className={className} aria-hidden>
    <defs>
      <radialGradient id="g1" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stopColor="#A5D6A7" />
        <stop offset="100%" stopColor="#66BB6A" />
      </radialGradient>
    </defs>
    <path d="M64 6c-19 0-42 25-42 50 0 22 18 40 42 40s42-18 42-40C106 31 83 6 64 6z" fill={AVO.peel} />
    <path d="M64 14c-16 0-34 22-34 42 0 19 15 34 34 34s34-15 34-34C98 36 80 14 64 14z" fill="url(#g1)" />
    <circle cx="64" cy="64" r="14" fill={AVO.pit} />
    <circle cx="52" cy="52" r="3.2" fill="#1f2937" />
    <circle cx="76" cy="52" r="3.2" fill="#1f2937" />
    <path d="M54 66c6 6 14 6 20 0" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

/*************************
 * Mock Data              *
 *************************/
const demoMenu = [
  { id: "m1", name: "Masala Dosa", price: 8.99, img: "https://images.unsplash.com/photo-1604908554007-1803e6cf0f9a?q=80&w=800&auto=format&fit=crop" },
  { id: "m2", name: "Idli (2pc)", price: 4.99, img: "https://images.unsplash.com/photo-1589307004173-3c95204f1e9b?q=80&w=800&auto=format&fit=crop" },
  { id: "m3", name: "Medu Vada (2pc)", price: 5.49, img: "https://images.unsplash.com/photo-1625944529265-21e0a3b9c37c?q=80&w=800&auto=format&fit=crop" },
  { id: "m4", name: "Paneer Biryani", price: 12.99, img: "https://images.unsplash.com/photo-1596797038530-2c1072294f1c?q=80&w=800&auto=format&fit=crop" },
  { id: "m5", name: "Filter Coffee", price: 2.99, img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop" },
];

// Specials chips shown in the chat area
export const DEFAULT_SPECIALS = [
  "Today's Special: Masala Dosa",
  "Deal of the Hour: Filter Coffee",
  "Chef's Pick: Paneer Biryani",
];

// FAQs chips shown inside the chat box
export const DEFAULT_FAQS = [
  "What are today's specials?",
  "Do you have vegan options?",
  "How spicy is the biryani?",
];

/****************
 * Helpers       *
 ****************/
export function shouldSuppressEnterToSend(e) {
  return e?.key === "Enter";
}

/****************
 * UI Pieces     *
 ****************/
const ChatHeader = () => (
  <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
    <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <AvocadoSVG />
        <div>
          <div className="text-sm font-semibold">AVA AI</div>
          <div className="text-xs text-muted-foreground">Simply South Assistant</div>
        </div>
      </div>
      <div className="h-6 w-6" />
    </div>
  </div>
);

const MessageBubble = ({ role, text }) => (
  <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow ${
        role === "user" ? "text-white rounded-br-sm" : "bg-muted rounded-bl-sm"
      }`}
      style={role === "user" ? { background: AVO.peel } : {}}
    >
      {text}
    </div>
  </div>
);

/** Split action: Add to plate + dropdown Add to basket (mock actions) */
const CardActions = ({ onPlate, onBasket }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative mt-2 flex items-stretch">
      <button
        onClick={onPlate}
        className="rounded-l-xl px-3 py-1.5 text-xs font-semibold text-white"
        style={{ background: AVO.peel }}
        onMouseOver={(e) => (e.currentTarget.style.background = AVO.peelDark)}
        onMouseOut={(e) => (e.currentTarget.style.background = AVO.peel)}
      >
        Add to plate
      </button>
      <button
        aria-label="More"
        onClick={() => setOpen((v) => !v)}
        className="rounded-r-xl border-l px-2 py-1.5 text-white"
        style={{ background: AVO.peel, borderColor: "rgba(255,255,255,0.3)" }}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 top-[110%] z-20 w-40 overflow-hidden rounded-xl border bg-white shadow-xl"
          >
            <button
              onClick={() => {
                onBasket();
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
            >
              Add to basket
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Horizontal MENU gallery */
const MenuCarousel = ({ items, onAddPlate, onAddBasket }) => (
  <div className="rounded-2xl border p-4">
    <div className="mb-2 text-sm font-semibold">Menu</div>
    <div className="no-scrollbar overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      <div className="flex gap-3 pb-2">
        {items.map((m) => (
          <div key={m.id} className="w-40 shrink-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 shadow-sm">
              <img src={m.img} alt={m.name} className="h-full w-full object-cover" />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="truncate font-medium" title={m.name}>
                {m.name}
              </span>
              <span className="text-slate-600">${m.price.toFixed(2)}</span>
            </div>
            <CardActions onPlate={() => onAddPlate(m)} onBasket={() => onAddBasket(m)} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/** Horizontal chips for specials/deals */
const SpecialsRow = ({ items, onSelect }) => (
  <div className="no-scrollbar -mx-1 overflow-x-auto px-1" style={{ scrollbarWidth: "none" }}>
    <div className="flex gap-2 pb-2">
      {items.map((it, idx) => (
        <button
          key={`${it}-${idx}`}
          onClick={() => onSelect?.(it)}
          className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          style={{ borderColor: AVO.flesh, color: AVO.peel }}
        >
          {it}
        </button>
      ))}
    </div>
  </div>
);

const ChatInput = ({ value, setValue, onSend }) => (
  <div className="sticky bottom-0 left-0 right-0 z-10 border-t bg-background p-3">
    <div className="flex items-center gap-2">
      <button aria-label="Voice input" className="rounded-xl border p-3 hover:bg-muted active:scale-[0.99]">
        <Mic className="h-6 w-6" />
      </button>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (shouldSuppressEnterToSend(e)) e.preventDefault();
        }}
        placeholder="Ask about the menu, deals, or your order…"
        enterKeyHint="done"
        className="flex-1 rounded-xl border px-3 py-3 text-base outline-none focus:ring-2"
        style={{ boxShadow: "none", borderColor: "#E5E7EB" }}
      />
      <button
        aria-label="Send message"
        onClick={onSend}
        className="rounded-xl p-3 text-white active:scale-[0.99]"
        style={{ background: AVO.peel }}
        onMouseOver={(e) => (e.currentTarget.style.background = AVO.peelDark)}
        onMouseOut={(e) => (e.currentTarget.style.background = AVO.peel)}
      >
        <Send className="h-6 w-6" />
      </button>
    </div>
  </div>
);

/****************
 * Chat Screen   *
 ****************/
const ChatbotView = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I’m AVA. Today’s specials are below." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  // Plate/Basket (mock only to enable the buttons visually)
  const [plate, setPlate] = useState({});
  const [basket, setBasket] = useState({});

  const addTo = (setter) => (item) =>
    setter((c) => ({ ...c, [item.id]: { item, qty: (c[item.id]?.qty || 0) + 1 } }));
  const addToPlate = addTo(setPlate);
  const addToBasket = addTo(setBasket);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg, { role: "assistant", text: "…" }]); // placeholder
    setInput("");

    const reply = await askBackend(userMsg.text);

    setMessages((m) => {
      const next = [...m];
      // replace last placeholder
      for (let i = next.length - 1; i >= 0; i--) {
        if (next[i].role === "assistant" && next[i].text === "…") {
          next[i] = { role: "assistant", text: reply };
          break;
        }
      }
      return next;
    });
  };


  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[100svh] flex-col">
      <ChatHeader />

      <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {/* Horizontal MENU gallery */}
        <MenuCarousel items={demoMenu} onAddPlate={addToPlate} onAddBasket={addToBasket} />

        {/* Chat area */}
        <div className="space-y-3">
          <div className="rounded-2xl border p-3">
            <div className="mb-2 text-xs font-semibold" style={{ color: AVO.peel }}>
              Today’s specials
            </div>
            <SpecialsRow items={DEFAULT_SPECIALS} onSelect={(t) => setInput(t)} />
          </div>

          {/* FAQs inside the chat box */}
          <div className="rounded-2xl border p-3">
            <div className="mb-2 text-xs font-semibold" style={{ color: AVO.peel }}>
              Quick FAQs
            </div>
            <SpecialsRow items={DEFAULT_FAQS} onSelect={(t) => setInput(t)} />
          </div>

          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} text={m.text} />
          ))}
          <div ref={endRef} />
        </div>
      </div>

      <ChatInput value={input} setValue={setInput} onSend={send} />
    </div>
  );
};

/****************
 * Root App      *
 ****************/
export default function AvocadoAVAApp() {
  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <ChatbotView />
    </div>
  );
}

/*************************
 * Minimal Console Tests  *
 *************************/
(function runDevTests() {
  try {
    const results = [];
    const assert = (name, cond) => results.push({ name, pass: !!cond });

    assert(
      "DEFAULT_SPECIALS is array of strings",
      Array.isArray(DEFAULT_SPECIALS) && DEFAULT_SPECIALS.every((s) => typeof s === "string")
    );

    assert(
      "Enter suppression works",
      shouldSuppressEnterToSend({ key: "Enter" }) === true && shouldSuppressEnterToSend({ key: "a" }) === false
    );

    assert(
      "demoMenu has images & prices",
      Array.isArray(demoMenu) && demoMenu.length > 0 && demoMenu.every((m) => typeof m.img === "string" && typeof m.price === "number")
    );

    const ok = results.every((r) => r.pass);
    // eslint-disable-next-line no-console
    console.log(
      `AVA mock tests: ${ok ? "✅ PASS" : "❌ FAIL"}`,
      results.map((r) => `${r.pass ? "✅" : "❌"} ${r.name}`).join(" | ")
    );

    // Additional tests for FAQs
    console.log("FAQ tests:", Array.isArray(DEFAULT_FAQS) && DEFAULT_FAQS.length === 3 && DEFAULT_FAQS.every((s)=> typeof s === "string"));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Test harness error", e);
  }
})();
