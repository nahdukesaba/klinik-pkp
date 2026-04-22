import HousingIndicatorsSection from "@/components/landing/HousingIndicatorsSection";
import { Footer, Navbar } from "@/components/layout";

export default function RumahLayakHuniPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 sm:pt-24 sm:pb-16">
        <HousingIndicatorsSection />
      </main>
      <Footer />
    </div>
  );
}
