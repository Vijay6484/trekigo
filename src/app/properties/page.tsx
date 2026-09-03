import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { StayExperiences } from "@/components/StayExperiences";

export default function PropertiesPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Navbar />
      <main className="mx-auto max-w-[1280px] py-8 pb-24">
        <StayExperiences />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
