"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/store/ui";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";

// Bottom navigation (Android-first) + slide-down menu drawer with Cream + Blue theme
export default function MobileNav() {
  const pathname = usePathname();
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const count = useCart((s) => s.count());

  if (pathname?.startsWith("/admin")) return null;

  const links = [
    {
      label: "Home",
      href: "/",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3z"
        />
      )
    },
    {
      label: "Shop",
      href: "/shop",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M3 3h2l2 12h11l2-8H6"
        />
      )
    },
    {
      label: "Account",
      href: user ? "/account" : "/login",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0"
        />
      )
    },
    {
      label: "Cart",
      href: "#",
      isCart: true,
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          d="M3 3h2l2 12h11l2-8H6M9 20a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
        />
      )
    }
  ];

  return (
    <>
      {/* Menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#F4EFE6] border-l border-[#E2D9C8] md:hidden p-6 flex flex-col justify-between shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E2D9C8]">
                  <div className="flex items-center gap-2">
                    <img src="/icons/logo.svg" alt="Alpha" className="w-7 h-7" />
                    <span className="font-serif text-xl font-bold text-[#1E3A8A]">Menu</span>
                  </div>
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="text-[#1E3A8A] hover:text-[#1E40AF] p-1.5 rounded-lg hover:bg-[#1E3A8A]/10 text-2xl font-light leading-none"
                    aria-label="Close menu"
                  >
                    &times;
                  </button>
                </div>
                <nav className="space-y-1.5">
                  {[
                    { label: "Home", href: "/" },
                    { label: "Shop", href: "/shop" },
                    { label: "About", href: "/about" },
                    { label: "Services", href: "/services" },
                    { label: "Contact", href: "/contact" }
                  ].map((l) => {
                    const isActive = pathname === l.href;
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl font-medium transition ${
                          isActive
                            ? "bg-[#1E3A8A] text-[#F4EFE6] font-semibold"
                            : "text-[#1E3A8A] hover:bg-[#1E3A8A]/10 hover:text-[#1E40AF]"
                        }`}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="mt-6 pt-6 border-t border-[#E2D9C8] space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 bg-[#EDE6D9] rounded-xl mb-2">
                      <div className="text-sm font-bold text-[#1E3A8A] truncate">{user.name}</div>
                      <div className="text-xs text-[#1E3A8A]/70 truncate">{user.email}</div>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-[#1E3A8A] font-medium hover:bg-[#1E3A8A]/10"
                    >
                      My Account
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 rounded-xl bg-[#1E3A8A] text-[#F4EFE6] font-semibold hover:bg-[#1E40AF]"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2.5 rounded-xl text-red-600 font-medium hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center px-4 py-3 rounded-xl font-semibold bg-[#1E3A8A] text-[#F4EFE6] hover:bg-[#1E40AF] shadow-sm transition"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#F4EFE6]/98 backdrop-blur border-t border-[#E2D9C8] pb-[env(safe-area-inset-bottom)] shadow-lg">
        <div className="grid grid-cols-4">
          {links.map((l) =>
            l.isCart ? (
              <button
                key={l.label}
                onClick={() => setCartOpen(true)}
                className="relative flex flex-col items-center justify-center py-2.5 text-[#1E3A8A] active:text-[#1E40AF]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {l.icon}
                </svg>
                <span className="text-[10px] font-medium mt-0.5">{l.label}</span>
                {count > 0 && (
                  <span className="absolute top-1 right-1/4 w-4 h-4 rounded-full bg-[#1E3A8A] text-[#F4EFE6] text-[10px] flex items-center justify-center font-bold">
                    {count}
                  </span>
                )}
              </button>
            ) : (
              <Link
                key={l.label}
                href={l.href}
                className={`flex flex-col items-center justify-center py-2.5 ${
                  pathname === l.href ? "text-[#1E40AF] font-bold" : "text-[#1E3A8A]"
                } active:text-[#1E40AF]`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {l.icon}
                </svg>
                <span className="text-[10px] font-medium mt-0.5">{l.label}</span>
              </Link>
            )
          )}
        </div>
      </nav>
    </>
  );
}
