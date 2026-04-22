import BuildingStepsSection from "@/components/landing/BuildingStepsSection";
import { Footer, Navbar } from "@/components/layout";

export default function TahapanPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 sm:pt-24 sm:pb-16">
        <BuildingStepsSection />
      </main>
      <Footer />
    </div>
  );
}
