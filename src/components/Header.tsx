"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import ThemeModal from "./ThemeModal";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useUI } from "@/store/ui";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" }
];

export default function Header() {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const count = useCart((s) => s.count());
  const setCartOpen = useUI((s) => s.setCartOpen);
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-[#F4EFE6] border-b border-[#E2D9C8] ${
          scrolled ? "shadow-md py-2.5 bg-[#F4EFE6]/98 backdrop-blur-md" : "py-3.5 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3.5 py-2 text-sm rounded-full transition-all duration-200 ${
                    isActive
                      ? "text-[#1E3A8A] font-bold bg-[#1E3A8A]/15 shadow-xs"
                      : "text-[#1E3A8A] font-medium hover:text-[#1E40AF] hover:bg-[#1E3A8A]/10"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme Palette Button */}
            <button
              onClick={() => setThemeModalOpen(true)}
              className="p-2.5 rounded-full text-[#1E3A8A] hover:text-[#1E40AF] hover:bg-[#1E3A8A]/10 transition relative focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30"
              title="Change Theme Appearance"
              aria-label="Theme Palette"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 3a9 9 0 019 9c0 2.5-1.5 3.5-3.5 3.5H16a2 2 0 00-2 2v.5c0 1.5-1 3-2 3"
                />
                <circle cx="8" cy="10" r="1.2" fill="currentColor" />
                <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
                <circle cx="16" cy="10" r="1.2" fill="currentColor" />
              </svg>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-full text-[#1E3A8A] hover:text-[#1E40AF] hover:bg-[#1E3A8A]/10 transition focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30"
              aria-label="Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l2 12h11l2-8H6" />
                <circle cx="9" cy="20" r="1.5" fill="currentColor" />
                <circle cx="17" cy="20" r="1.5" fill="currentColor" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1E3A8A] text-[#F4EFE6] text-[11px] flex items-center justify-center font-bold shadow-xs">
                  {count}
                </span>
              )}
            </button>

            {user ? (
              user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="bg-[#1E3A8A] hover:bg-[#1E40AF] text-[#F4EFE6] text-sm px-4 py-2 rounded-full font-semibold shadow-xs transition duration-200"
                >
                  Admin
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setAccountOpen((v) => !v)}
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-[#1E3A8A] hover:bg-[#1E40AF] text-[#F4EFE6] text-sm font-semibold shadow-xs transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/40"
                    aria-label="User Account Menu"
                  >
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#F4EFE6] rounded-xl shadow-xl border border-[#E2D9C8] text-[#1E3A8A] overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-[#E2D9C8] bg-[#EDE6D9]">
                        <div className="font-bold text-sm text-[#1E3A8A] truncate">{user.name}</div>
                        <div className="text-xs text-[#1E3A8A]/70 truncate">{user.email}</div>
                      </div>
                      <Link
                        href="/account"
                        className="block px-4 py-2.5 text-sm font-medium hover:bg-[#1E3A8A]/10 hover:text-[#1E40AF] transition"
                      >
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        className="block px-4 py-2.5 text-sm font-medium hover:bg-[#1E3A8A]/10 hover:text-[#1E40AF] transition"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          setAccountOpen(false);
                          setThemeModalOpen(true);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-[#1E3A8A]/10 hover:text-[#1E40AF] transition"
                      >
                        🎨 Change Theme
                      </button>
                      <div className="border-t border-[#E2D9C8]">
                        <button
                          onClick={() => logout()}
                          className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <Link href="/login" className="text-sm font-semibold text-[#1E3A8A] hover:text-[#1E40AF] px-3.5 py-1.5 rounded-full hover:bg-[#1E3A8A]/10 border border-[#1E3A8A]/25 transition">
                Login
              </Link>
            )}

            {/* Mobile menu toggle */}
            <MobileMenuToggle onOpenTheme={() => setThemeModalOpen(true)} />
          </div>
        </div>
      </header>

      <ThemeModal isOpen={themeModalOpen} onClose={() => setThemeModalOpen(false)} />
    </>
  );
}

function MobileMenuToggle({ onOpenTheme }: { onOpenTheme: () => void }) {
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="md:hidden p-2.5 rounded-full text-[#1E3A8A] hover:text-[#1E40AF] hover:bg-[#1E3A8A]/10 transition"
      aria-label="Menu"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {open ? (
          <path strokeLinecap="round" strokeWidth="1.8" d="M6 6l12 12M18 6L6 18" />
        ) : (
          <path strokeLinecap="round" strokeWidth="1.8" d="M4 7h16M4 12h16M4 17h16" />
        )}
      </svg>
    </button>
  );
}
