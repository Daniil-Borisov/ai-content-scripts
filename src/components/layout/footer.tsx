import Link from "next/link";

const footerLinks = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Platforms", href: "#platforms" },
  { label: "Pricing", href: "#pricing" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="bg-surface text-surface-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
                <span className="text-surface font-bold text-xs">SF</span>
              </div>
              <span className="font-heading text-lg tracking-tight text-white">
                ScriptForge
              </span>
            </div>
            <p className="text-sm text-white/40 max-w-[260px]">
              AI-powered content scripts for every platform. From idea to
              publish-ready in minutes.
            </p>
          </div>

          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; 2026 ScriptForge AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span>Visa</span>
            <span>&middot;</span>
            <span>Mastercard</span>
            <span>&middot;</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
