import {
  Cpu,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Heart,
  Palette,
  TrendingUp,
} from "lucide-react";

const templates = [
  { icon: Cpu, name: "Tech & AI" },
  { icon: Dumbbell, name: "Fitness & Health" },
  { icon: Briefcase, name: "Business & Finance" },
  { icon: GraduationCap, name: "Education" },
  { icon: Gamepad2, name: "Gaming" },
  { icon: Heart, name: "Lifestyle & Travel" },
  { icon: Palette, name: "Creative & Design" },
  { icon: TrendingUp, name: "Marketing & Social" },
];

export function TemplatesSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-14">
          <div>
            <h2 className="font-heading text-foreground text-[32px] leading-[110%] tracking-[-0.025em] lg:text-[44px] mb-4">
              Templates for every niche
            </h2>
          </div>
          <p className="text-muted-foreground text-base lg:text-lg max-w-[480px] mt-4 lg:mt-0">
            Pre-built prompt templates optimized for each content niche. Your
            Creator Profile adapts the tone, depth, and style automatically.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <div
                key={template.name}
                className="bg-card border border-border rounded-[12px] p-5 flex items-center gap-3 cursor-pointer hover:border-foreground/20 transition-colors"
              >
                <Icon size={18} className="text-foreground/60 shrink-0" />
                <span className="text-sm">{template.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
