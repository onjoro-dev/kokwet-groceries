import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import BrandVisual from "../ui/BrandVisual";
import { getSettings } from "../../services/adminService";

const QUICK_REPLIES = [
  { label: "Order question", text: "Hi, I have a question about my order." },
  { label: "Delivery", text: "Hi, I have a question about delivery." },
  { label: "Product enquiry", text: "Hi, I have a question about a product." },
];

export default function HelpChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getSettings().then((settings) => {
      setPhone(settings.phone || "");
      setEmail(settings.email || "");
    }).catch(() => undefined);
  }, []);

  const digits = phone.replace(/\D/g, "");
  const whatsappPhone = digits.startsWith("0") ? `254${digits.slice(1)}` : digits.length === 9 ? `254${digits}` : digits;
  const hasWhatsApp = whatsappPhone.length >= 11 && whatsappPhone !== "254700000000";

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !hasWhatsApp) return;
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(trimmed)}`, "_blank", "noopener,noreferrer");
  };

  return <div className="fixed bottom-20 right-3 z-50 sm:bottom-5 sm:right-5">
    {open && <section className="mb-3 flex h-[min(31rem,calc(100vh-7rem))] w-[min(25rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl" aria-label="KOKWET live chat">
      <div className="flex items-center justify-between bg-brand-800 px-4 py-3 text-white">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><MessageCircle size={21} /></span><div><p className="font-bold">Chat with KOKWET</p><p className="text-[11px] text-white/75">Send an enquiry to our store</p></div></div>
        <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close chat"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <p className="rounded-2xl rounded-bl-sm bg-white p-3 text-sm leading-5 text-gray-700 shadow-sm">Tell us what you need help with. Your message will open in WhatsApp so you can chat directly with the store team.</p>
        {!hasWhatsApp && <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">WhatsApp contact is not set up yet. {email ? `Email the store at ${email}.` : "Please check back soon for store contact details."}</p>}
        {email && <a href={`mailto:${email}`} className="mt-3 inline-flex text-sm font-semibold text-brand-700 hover:underline">Email the store: {email}</a>}
      </div>
      <div className="border-t border-gray-200 bg-white p-3">
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {QUICK_REPLIES.map((item) => <button key={item.label} onClick={() => { setMessage(item.text); messageRef.current?.focus(); }} className="shrink-0 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100">{item.label}</button>)}
        </div>
        <form onSubmit={sendMessage} className="flex items-end gap-2"><label className="sr-only" htmlFor="kokwet-help-message">Write a message</label><textarea ref={messageRef} id="kokwet-help-message" rows={2} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write your enquiry…" className="min-w-0 flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500" /><button type="submit" disabled={!message.trim() || !hasWhatsApp} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50" aria-label="Continue to WhatsApp"><Send size={17} /></button></form>
      </div>
    </section>}
    <button onClick={() => setOpen((value) => !value)} aria-expanded={open} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-800" aria-label={open ? "Close help" : "Open quick help"}>{open ? <X size={25} /> : <BrandVisual slot="helpLauncher" fallback={<MessageCircle size={23} />} className="h-10 w-10" imageClassName="h-full w-full rounded-full object-cover" />}</button>
  </div>;
}
