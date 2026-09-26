import type { Metadata } from "next";
import { MobileNav } from "@/components/MobileNav";
import { StoriesFeed } from "@/components/StoriesFeed";

export const metadata: Metadata = {
  title: "Stories - Trekigo",
  description: "Short films from the hills. Villas, creeks, and cloud lines around Lonavala, Karjat, and Mulshi.",
};

export default function StoriesPage() {
  return (
    <div className="relative h-dvh overflow-hidden bg-[#120f0d]">
      <StoriesFeed />
      <MobileNav />
    </div>
  );
}
