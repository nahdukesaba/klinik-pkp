import {
  AboutSection,
  BuildingStepsSection,
  HeroSection,
  HousingIndicatorsSection,
  ServicesSection,
} from "@/components/landing";
import { Footer, Navbar } from "@/components/layout";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <HousingIndicatorsSection />
        <BuildingStepsSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
