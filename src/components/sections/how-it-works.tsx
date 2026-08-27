import { Lightbulb, Search, FileText, Send } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    number: "01",
    title: "Set your profile",
    description:
      "Define your niche, audience, tone of voice, and target platforms. ScriptForge remembers your style across every project.",
  },
  {
    icon: Search,
    number: "02",
    title: "Pick a topic & research",
    description:
      "Enter any topic — our AI generates 10 angles, then deep-researches the best one with facts, sources, and insights.",
  },
  {
    icon: FileText,
    number: "03",
    title: "Get your scripts",
    description:
      "Receive a full YouTube script plus adapted versions for TikTok, Instagram, LinkedIn, and X — all from one idea.",
  },
  {
    icon: Send,
    number: "04",
    title: "Edit & publish",
    description:
      "Fine-tune any block, regenerate sections, export to your format, and publish. Your content pack is ready to go.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 bg-surface text-surface-foreground"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading text-white text-[32px] leading-[110%] tracking-[-0.025em] lg:text-[44px] mb-4">
            How it works
          </h2>
          <p className="text-white/50 text-base lg:text-lg max-w-[460px] mx-auto">
            From topic to publish-ready content pack in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="border border-white/10 rounded-[12px] p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <Icon size={18} className="text-white/60" />
                  <span className="text-xs text-white/30 tracking-widest">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-base font-medium text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
