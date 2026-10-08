import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";

export default function StaffLogin({ expectedRole }: { expectedRole: "storekeeper" | "delivery_officer" }) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const title = expectedRole === "storekeeper" ? "Storekeeper" : "Delivery officer";
  if (user?.role === expectedRole) return <Navigate to={expectedRole === "storekeeper" ? "/admin/products" : "/admin/orders"} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const loggedIn = await login(email, password);
      if (loggedIn.role !== expectedRole) { logout(); setError(`This sign-in link is for ${title.toLowerCase()} accounts.`); return; }
      navigate(expectedRole === "storekeeper" ? "/admin/products" : "/admin/orders");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };

  return <main className="flex min-h-screen items-center justify-center bg-brand-800 px-4"><div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"><h1 className="text-center text-xl font-bold text-gray-800">{title} sign in</h1><p className="mb-6 mt-2 text-center text-sm text-gray-500">Use the staff account created for you by the store admin.</p><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium text-gray-600">Email<input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5" /></label><label className="block text-sm font-medium text-gray-600">Password<input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5" /></label>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<Button type="submit" fullWidth disabled={busy}>{busy ? "Signing in..." : "Sign in"}</Button></form></div></main>;
}
