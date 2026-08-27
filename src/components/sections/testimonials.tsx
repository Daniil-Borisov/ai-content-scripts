import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "YouTube Creator, 120K subs",
    text: "ScriptForge cut my scripting time from 3 hours to 15 minutes. The YouTube scripts are structured exactly how my audience expects — hook, story, value, CTA. I've published 3x more videos since I started using it.",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "Social Media Manager",
    text: "Managing content for 5 platforms used to take my whole team a week. Now I generate a content pack in under 2 minutes and we just tweak the tone. The LinkedIn adaptations are surprisingly good.",
    rating: 5,
  },
  {
    name: "Aisha Patel",
    role: "Fitness Creator, TikTok & Reels",
    text: "The short-form scripts are punchy and actually sound like me, not like a robot. I love that I can regenerate just the hook if it doesn't hit right. Worth every penny of the Creator pack.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-surface text-surface-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-14">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <h2 className="font-heading text-white text-[32px] leading-[110%] tracking-[-0.025em] lg:text-[44px]">
              Creators love it
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/80 font-medium">4.9</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-xs text-white/40">120+ reviews</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="border border-white/10 rounded-[12px] p-6 flex flex-col justify-between min-h-[260px]"
            >
              <div>
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star
                      key={j}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-white/70">
                  {t.text}
                </p>
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-white/40">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
