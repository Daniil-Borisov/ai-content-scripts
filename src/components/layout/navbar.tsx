"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Menu, X, Coins, LogOut, User, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Platforms", href: "#platforms" },
  { label: "Pricing", href: "#pricing" },
];

const dashboardLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "New Project", href: "/dashboard/new" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Profile", href: "/dashboard/profile" },
];

interface UserInfo {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth status
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          // Fetch credits
          fetch("/api/credits")
            .then((res) => res.json())
            .then((creditsData) => {
              setCredits(creditsData.balance || 0);
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSignOut = async () => {
    window.location.href = "/api/auth/signout";
  };

  return (
    <header>
      <nav className="fixed top-0 left-0 w-full z-[999]">
        <div className="container mx-auto px-4">
          <div className="header-wrapper rounded-[16px] shadow-lg flex items-center justify-between bg-white h-[56px] mt-6 px-5">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SF</span>
                </div>
                <span className="font-heading text-lg tracking-tight text-foreground">
                  ScriptForge
                </span>
              </Link>

              <ul className="hidden md:flex items-center space-x-7 ml-8">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-foreground/60 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop - Logged out */}
            {!isLoading && !user && (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" })
                  )}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px] px-5"
                  )}
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Desktop - Logged in */}
            {!isLoading && user && (
              <div className="hidden md:flex items-center gap-4">
                {/* Credits */}
                <Link
                  href="/#pricing"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Coins size={14} />
                  <span className="font-medium">{credits ?? 0}</span>
                </Link>

                {/* Dashboard link */}
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-[8px]"
                  )}
                >
                  <LayoutDashboard size={14} className="mr-1.5" />
                  Dashboard
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="w-7 h-7 rounded-full"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {(user.name || user.email || "U")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[1000]"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-[12px] shadow-lg py-2 z-[1001]">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium truncate">
                            {user.name || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <LayoutDashboard size={14} />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <User size={14} />
                            Profile
                          </Link>
                          <Link
                            href="/dashboard/projects"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <Coins size={14} />
                            Credits: {credits ?? 0}
                          </Link>
                        </div>

                        <div className="border-t border-border pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                          >
                            <LogOut size={14} />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Mobile */}
            <div className="flex md:hidden items-center gap-2">
              {user ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px] px-4"
                  )}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px] px-4"
                  )}
                >
                  Start
                </Link>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex items-center justify-center w-10 h-10"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-surface text-surface-foreground z-[1000] flex flex-col items-center justify-center space-y-6">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-8 right-6"
            >
              <X size={28} />
            </button>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-heading"
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <div className="w-16 h-px bg-white/20 my-2" />
                {dashboardLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg text-white/70"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex items-center gap-2 text-white/50">
                  <Coins size={16} />
                  <span>{credits ?? 0} credits</span>
                </div>
              </>
            )}

            {user ? (
              <button
                onClick={handleSignOut}
                className="text-lg text-red-400 mt-4"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/register"
                className={cn(
                  buttonVariants(),
                  "bg-cta text-cta-foreground hover:bg-cta/90 rounded-[8px] mt-4"
                )}
              >
                Get started
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
