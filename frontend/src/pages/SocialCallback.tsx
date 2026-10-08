import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SocialCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const role = params.get("role");
    if (!token) {
      navigate(`/login?error=${encodeURIComponent("Social sign-in failed.")}`, { replace: true });
      return;
    }
    loginWithToken(token).then(() => navigate(role === "admin" ? "/admin" : "/account", { replace: true })).catch(() => navigate("/login", { replace: true }));
  }, [loginWithToken, navigate, params]);

  return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading your social account…</div>;
}
