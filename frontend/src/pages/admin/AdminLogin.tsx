import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Logo from "../../components/layout/Logo";

/** Dedicated login screen for shop staff — plain language, no customer-facing clutter. */
export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedIn = await login(email, password);
      if (loggedIn.role === "admin") navigate("/admin");
      else if (loggedIn.role === "storekeeper") navigate("/admin/products");
      else if (loggedIn.role === "delivery_officer") navigate("/admin/orders");
      else setError("This account doesn't have staff access.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <Logo compact />
          <h1 className="text-lg font-bold text-gray-800 mt-2">KOKWET Admin</h1>
          <p className="text-sm text-gray-500">Sign in to manage your store</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-sm font-medium text-gray-600">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:border-brand-400 outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" fullWidth size="lg" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-5">
          Demo login: admin@kokwetgroceries.co.ke / admin1234
        </p>
      </div>
    </div>
  );
}
