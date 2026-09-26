import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { StayExperiences } from "@/components/StayExperiences";
import { fetchProperties } from "@/lib/api";

export default async function PropertiesPage() {
  const properties = await fetchProperties();

  return (
    <div className="pt-16 md:pt-20">
      <Navbar />
      <main className="mx-auto max-w-[1280px] py-8 pb-24">
        <StayExperiences properties={properties} />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
