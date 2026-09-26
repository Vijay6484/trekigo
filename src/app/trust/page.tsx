import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { TrustBlock } from "@/components/TrustBlock";
import { fetchReviews } from "@/lib/api";

export default async function TrustPage() {
  const reviews = await fetchReviews();

  return (
    <div className="pt-16 md:pt-20">
      <Navbar />
      <main className="mx-auto flex max-w-[1280px] flex-col gap-12 py-10 pb-16">
        <TrustBlock reviews={reviews} />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
