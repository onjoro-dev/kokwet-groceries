import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSocialConfig } from "../services/authService";
import Button from "../components/ui/Button";
import Logo from "../components/layout/Logo";

/** New customer sign-up page. */
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [socialProviders, setSocialProviders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getSocialConfig().then(setSocialProviders).catch(() => undefined);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({ name, email, phone, password });
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <div className="flex justify-center mb-6">
        <Logo />
      </div>
      <h1 className="text-xl font-bold text-gray-800 text-center mb-6">Create your account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Phone number</label>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600">Password</label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" fullWidth size="lg" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      {(socialProviders.google || socialProviders.facebook) && (
        <div className="mt-5 space-y-2">
          {socialProviders.google && <a href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/social/google`} className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Continue with Google</a>}
          {socialProviders.facebook && <a href={`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/social/facebook`} className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Continue with Facebook</a>}
        </div>
      )}

      <p className="text-sm text-gray-500 text-center mt-5">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-700 font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
