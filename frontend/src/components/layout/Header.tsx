import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

/** Sticky top header: logo, search bar, and quick access to account + cart. */
export default function Header() {
  const { itemCount, openCart } = useCart();
  const { user, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5 sm:gap-5 sm:px-6 sm:py-3">
        <Logo />

        <SearchBar className="hidden sm:block" />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="relative hidden sm:block">
            <button
              onClick={() => setAccountOpen((o) => !o)}
              aria-expanded={accountOpen}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-brand-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
              <span className="hidden md:inline">{user ? user.name.split(" ")[0] : "Account"}</span>
            </button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white py-1 text-sm shadow-xl">
                {user ? (
                  <>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-brand-50" onClick={() => setAccountOpen(false)}>
                      My orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-brand-50 text-red-600"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-4 py-2 hover:bg-brand-50" onClick={() => setAccountOpen(false)}>
                      Log in
                    </Link>
                    <Link to="/register" className="block px-4 py-2 hover:bg-brand-50" onClick={() => setAccountOpen(false)}>
                      Create account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:px-4"
            aria-label="Open cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-accent-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="px-3 pb-3 sm:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
