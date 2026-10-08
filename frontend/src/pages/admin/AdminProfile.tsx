import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/authService";
import Button from "../../components/ui/Button";

export default function AdminProfile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage(""); setError("");
    try {
      await updateProfile({ name, email, phone, password: password || undefined });
      await refreshUser();
      setPassword("");
      setMessage("Your profile was updated.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-gray-800">My profile</h1>
      <p className="mb-6 text-sm text-gray-500">Update your own details. Leave the password blank to keep the current password.</p>
      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-card sm:grid-cols-2">
        <label className="text-sm text-gray-600">Full name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5" /></label>
        <label className="text-sm text-gray-600">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5" /></label>
        <label className="text-sm text-gray-600">Phone<input required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5" /></label>
        <label className="text-sm text-gray-600">New password<input minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Leave blank to keep current password" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5" /></label>
        {message && <p className="sm:col-span-2 text-sm text-green-700">{message}</p>}
        {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
        <div className="sm:col-span-2"><Button disabled={busy}>{busy ? "Saving..." : "Save profile"}</Button></div>
      </form>
    </div>
  );
}
