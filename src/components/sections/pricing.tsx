import { buttonVariants } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const packs = [
  {
    name: "Try it",
    price: "$4.99",
    scripts: "1 script",
    description: "Perfect for your first try",
    features: [
      "1 full content pack",
      "All 5 platforms",
      "Creator Profile",
      "Research & sources",
    ],
    popular: false,
  },
  {
    name: "Starter",
    price: "$14.99",
    scripts: "5 scripts",
    description: "For small creators",
    features: [
      "5 content packs",
      "All 5 platforms",
      "Creator Profile",
      "Research & sources",
      "Block regeneration",
    ],
    popular: false,
  },
  {
    name: "Creator",
    price: "$24.99",
    scripts: "10 scripts",
    description: "Regular content schedule",
    features: [
      "10 content packs",
      "All 5 platforms",
      "Creator Profile",
      "Research & sources",
      "Block regeneration",
      "Template library",
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: "$49.99",
    scripts: "25 scripts",
    description: "For teams & power creators",
    features: [
      "25 content packs",
      "All 5 platforms",
      "Creator Profile",
      "Research & sources",
      "Block regeneration",
      "Template library",
      "Priority generation",
      "API access (coming soon)",
    ],
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-heading text-foreground text-[32px] leading-[110%] tracking-[-0.025em] lg:text-[44px] mb-4">
            Simple pricing
          </h2>
          <p className="text-muted-foreground text-base lg:text-lg max-w-[460px] mx-auto">
            No subscriptions. Buy script packs and use them anytime. Credits
            never expire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {packs.map((pack) => (
            <div
              key={pack.name}
              className={`relative rounded-[12px] p-6 flex flex-col ${
                pack.popular
                  ? "bg-surface text-surface-foreground border-2 border-foreground"
                  : "bg-card border border-border"
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-foreground text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-base font-medium mb-1 ${
                    pack.popular ? "text-white" : ""
                  }`}
                >
                  {pack.name}
                </h3>
                <p
                  className={`text-xs ${
                    pack.popular ? "text-white/50" : "text-muted-foreground"
                  }`}
                >
                  {pack.description}
                </p>
              </div>

              <div className="mb-6">
                <span
                  className={`text-3xl font-heading ${
                    pack.popular ? "text-white" : ""
                  }`}
                >
                  {pack.price}
                </span>
                <span
                  className={`text-sm ml-1.5 ${
                    pack.popular ? "text-white/50" : "text-muted-foreground"
                  }`}
                >
                  / {pack.scripts}
                </span>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {pack.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm"
                  >
                    <Check
                      size={14}
                      className={`mt-0.5 shrink-0 ${
                        pack.popular ? "text-white/60" : "text-foreground/40"
                      }`}
                    />
                    <span
                      className={
                        pack.popular ? "text-white/70" : "text-muted-foreground"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants(),
                  "w-full rounded-[8px] h-[44px]",
                  pack.popular
                    ? "bg-cta text-cta-foreground hover:bg-cta/90"
                    : "bg-foreground text-background hover:bg-foreground/90"
                )}
              >
                Get {pack.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
