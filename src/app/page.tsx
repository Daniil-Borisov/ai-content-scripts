import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { PlatformsSection } from "@/components/sections/platforms";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { TemplatesSection } from "@/components/sections/templates";
import { PricingSection } from "@/components/sections/pricing";
import { CtaBanner } from "@/components/sections/cta-banner";
import { TestimonialsSection } from "@/components/sections/testimonials";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <PlatformsSection />
        <HowItWorksSection />
        <TemplatesSection />
        <TestimonialsSection />
        <CtaBanner />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
