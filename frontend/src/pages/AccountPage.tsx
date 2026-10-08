import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

/** Simple account overview: profile info, quick links, and log out. */
export default function AccountPage() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login?redirect=/account" replace />;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="border border-gray-100 rounded-xl shadow-card divide-y divide-gray-100">
        <Link to="/orders" className="flex items-center justify-between px-4 py-3 hover:bg-brand-50 rounded-t-xl">
          <span className="text-sm font-medium text-gray-700">My orders</span>
          <span className="text-gray-300">›</span>
        </Link>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-medium text-gray-700">Phone</span>
          <span className="text-sm text-gray-500">{user.phone}</span>
        </div>
      </div>

      <div className="mt-6">
        <Button variant="outline" fullWidth onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
