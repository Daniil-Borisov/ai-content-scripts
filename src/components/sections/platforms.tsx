import {
  Play,
  Camera,
  Briefcase,
  Hash,
  Clapperboard,
} from "lucide-react";

const platforms = [
  {
    icon: Play,
    name: "YouTube",
    items: [
      "Research & angle",
      "Hook & outline",
      "Full script (5–30+ min)",
      "B-roll notes",
      "Titles, description, chapters",
    ],
  },
  {
    icon: Clapperboard,
    name: "TikTok / Reels / Shorts",
    items: [
      "Hook (15–90 sec)",
      "Short script",
      "On-screen text",
      "CTA & caption",
      "B-roll ideas",
    ],
  },
  {
    icon: Camera,
    name: "Instagram Carousel",
    items: [
      "Hook slide",
      "5–10 slide structure",
      "Slide-by-slide text",
      "CTA slide",
      "Caption",
    ],
  },
  {
    icon: Briefcase,
    name: "LinkedIn",
    items: [
      "Hook",
      "Story / problem",
      "Insight & arguments",
      "CTA",
      "Professional tone",
    ],
  },
  {
    icon: Hash,
    name: "X / Threads",
    items: [
      "Short post",
      "Thread structure",
      "Key arguments",
      "Engagement hooks",
      "Hashtags",
    ],
  },
];

export function PlatformsSection() {
  return (
    <section id="platforms" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-14">
          <div>
            <h2 className="font-heading text-foreground text-[32px] leading-[110%] tracking-[-0.025em] lg:text-[44px] mb-4">
              One script, every platform
            </h2>
          </div>
          <p className="text-muted-foreground text-base lg:text-lg max-w-[480px] mt-4 lg:mt-0">
            Generate platform-native content from a single idea. Each format is
            optimized for its audience, length, and engagement style.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Platform cards */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.name}
                  className="bg-card border border-border rounded-[12px] p-6"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <Icon size={18} className="text-foreground/70" />
                    <h3 className="text-base font-medium">{platform.name}</h3>
                  </div>
                  <ul className="space-y-2">
                    {platform.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <div className="w-1 h-1 rounded-full bg-foreground/30 mt-2 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Script editor preview */}
          <div className="hidden lg:block w-full max-w-[400px] sticky top-28">
            <img
              src="/images/script-editor.svg"
              alt="ScriptForge script editor with block-based editing"
              className="w-full h-auto rounded-[12px] shadow-lg"
            />
            <p className="text-xs text-muted-foreground text-center mt-3">
              Block-based editor with inline editing and regeneration
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
