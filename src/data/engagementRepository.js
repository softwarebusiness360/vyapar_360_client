import { uid } from "../lib/utils";
import { read, write, STORAGE_KEYS as KEYS } from "./storage";

export const CHAT_STORAGE_KEY = KEYS.chats;
export function getCustomerTransactions({ id, phone, name }) {
  const matches = (rec) => {
    if (id && rec.customerId === id) return true;
    if (phone && rec.customer?.phone === phone) return true;
    if (name && !phone && rec.customer?.name === name) return true;
    return false;
  };
  const orders = read(KEYS.orders, []).filter(matches);
  const bookings = read(KEYS.bookings, []).filter(matches);
  return { orders, bookings };
}
const AUTO_ANSWERS = [
  { match: /(hi|hello|hey|namaste)/i,           reply: "Hi 👋 How can I help today? You can ask about orders, delivery, payments, or timings." },
  { match: /(order|track|status)/i,             reply: "You can view live status on your profile. Tap the profile icon on your storefront." },
  { match: /(delivery|deliver|when|reach)/i,    reply: "Most restaurants deliver within 30–45 minutes. Salons confirm bookings instantly." },
  { match: /(refund|cancel|cancelled|return)/i, reply: "For refunds or cancellations, please reach out to the store directly from your order page." },
  { match: /(payment|pay|upi|card)/i,           reply: "We accept UPI, cards, and net banking. Cash on delivery is at the store's discretion." },
  { match: /(offer|discount|coupon)/i,          reply: "Occasional offers appear on each storefront's home page. Keep an eye out for badges!" },
  { match: /(hour|open|close|timing)/i,         reply: "Timings vary by store. You'll find them on the storefront header." },
  { match: /(bye|thanks|thank you|ok)/i,        reply: "Anytime! Have a great day 🌟" },
];

export function getAutoReply(text) {
  const found = AUTO_ANSWERS.find((a) => a.match.test(text || ""));
  return found ? found.reply : "Thanks for the message! We'll come back with a human answer soon. Meanwhile, try asking about orders, payments, or timings.";
}

export function getChatTranscript(customerId) {
  const all = read(KEYS.chats, {});
  return all[customerId] || [];
}
export function appendChat(customerId, message) {
  const all = read(KEYS.chats, {});
  const list = all[customerId] || [];
  const entry = { ...message, id: uid("msg"), at: new Date().toISOString() };
  list.push(entry);
  all[customerId] = list;
  write(KEYS.chats, all);
  return entry;
}
