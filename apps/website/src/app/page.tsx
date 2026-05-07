import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Models } from "@/components/landing/models";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { CTA } from "@/components/landing/cta";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <Models />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
