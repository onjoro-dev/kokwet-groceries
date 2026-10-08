import { Link, useParams } from "react-router-dom";

const HELP: Record<string, { title: string; copy: string; steps: string[] }> = {
  help: { title: "How can we help?", copy: "Quick answers for shopping and delivery.", steps: ["Add items to your cart and continue to checkout.", "Enter your delivery area and a nearby landmark.", "Pay using M-Pesa and track progress in My orders."] },
  delivery: { title: "Delivery areas", copy: "We deliver across Kitale Town and nearby neighbourhoods.", steps: ["Choose your delivery area at checkout.", "Enter a required landmark so the rider can find you.", "Paste a Google Maps pin or allow location access for precise directions."] },
  payment: { title: "M-Pesa payments", copy: "M-Pesa is the available checkout payment method.", steps: ["Place your order with a reachable phone number.", "The store team will confirm your M-Pesa payment.", "Your order status updates in My orders after payment is confirmed."] },
  returns: { title: "Returns and order help", copy: "Need help with an item or delivery? Contact our team with your order number.", steps: ["Open My orders and copy your order number.", "Call 0700 000 000 or email hello@kokwetgroceries.co.ke.", "Our team will help arrange a resolution."] },
};

export default function HelpPage() {
  const { topic = "help" } = useParams();
  const content = HELP[topic] || HELP.help;
  return <div className="max-w-2xl mx-auto px-4 py-10"><p className="text-sm text-brand-700 font-semibold mb-2">KOKWET customer guide</p><h1 className="text-2xl font-bold text-gray-800">{content.title}</h1><p className="mt-2 text-gray-500">{content.copy}</p><ol className="mt-6 space-y-3">{content.steps.map((step, index) => <li key={step} className="flex gap-3 rounded-xl border border-gray-100 p-4"><span className="w-7 h-7 shrink-0 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">{index + 1}</span><span className="text-sm text-gray-700">{step}</span></li>)}</ol><div className="mt-6 flex gap-4 text-sm"><Link className="text-brand-700 font-semibold hover:underline" to="/search">Browse groceries</Link><a className="text-brand-700 font-semibold hover:underline" href="tel:+254700000000">Call support</a></div></div>;
}
