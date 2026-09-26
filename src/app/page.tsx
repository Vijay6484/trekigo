import Link from "next/link";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import { HomeSearch } from "@/components/HomeSearch";
import { Icon } from "@/components/Icon";
import { MobileNav } from "@/components/MobileNav";
import { MostLovedVideos } from "@/components/MostLovedVideos";
import { Navbar } from "@/components/Navbar";
import { OffersCarousel } from "@/components/OffersCarousel";
import { SectionHeading } from "@/components/SectionHeading";
import { StayExperiences } from "@/components/StayExperiences";
import { TrustBlock } from "@/components/TrustBlock";
import { fetchExperiences, fetchMostLoved, fetchPackages, fetchProperties, fetchReviews } from "@/lib/api";
import { blogs, destinations } from "@/lib/data";

export default async function HomePage() {
  const [properties, videos, packages, experiences, reviews] = await Promise.all([
    fetchProperties(),
    fetchMostLoved(),
    fetchPackages(),
    fetchExperiences(),
    fetchReviews(),
  ]);

  return (
    <div>
      <div className="relative">
        <Navbar overlay />
        <OffersCarousel />
      </div>
      <main className="relative z-10 mx-auto flex max-w-[1280px] -mt-8 flex-col gap-12 pb-16 md:-mt-10 md:gap-16">
        <div className="relative z-20">
          <HomeSearch />
        </div>

        <section className="px-container-margin-mobile md:px-container-margin-desktop">
          <SectionHeading title="Pick a destination" />
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            {destinations.map((destination) => (
              <button
                key={destination.name}
                type="button"
                className="flex min-w-[88px] flex-col items-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 py-3 text-on-surface-variant hover:border-on-surface"
              >
                <Icon name={destination.icon} className="text-[26px]" />
                <span className="text-sm font-medium">{destination.name}</span>
              </button>
            ))}
          </div>
        </section>

        <StayExperiences properties={properties} />
        <MostLovedVideos videos={videos} />

        <section
          id="packages"
          className="px-container-margin-mobile md:px-container-margin-desktop"
        >
          <SectionHeading title="Packages" />
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x md:grid md:grid-cols-2">
            {packages.map((item) => (
              <Link
                key={item.id ?? item.name}
                href={item.propertyId ? `/property/${item.propertyId}` : "/properties"}
                className="relative min-w-[280px] flex-1 overflow-hidden rounded-xl snap-start md:min-w-0"
              >
                <img src={item.img} alt={item.name} className="h-44 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-white/80">
                      {item.nights} · ₹{item.price}
                    </p>
                  </div>
                  <Icon name="chevron_right" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-container-margin-mobile md:px-container-margin-desktop">
          <SectionHeading title="Experiences" />
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x">
            {experiences.map((item) => (
              <Link
                key={item.id ?? item.name}
                href="/experiences"
                className="min-w-[280px] flex-1 snap-start overflow-hidden rounded-xl border border-outline-variant bg-surface md:min-w-0"
              >
                <img src={item.img} alt={item.name} className="h-40 w-full object-cover" />
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {item.description || "Add to your stay"}
                    </p>
                  </div>
                  <Icon name="chevron_right" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <TrustBlock reviews={reviews} />

        <section
          id="blogs"
          className="px-container-margin-mobile md:px-container-margin-desktop"
        >
          <SectionHeading
            title="Blogs"
            action={
              <Link href="/blogs" className="text-sm font-medium text-on-surface-variant">
                View all
              </Link>
            }
          />
          <div className="flex gap-4 overflow-x-auto hide-scrollbar snap-x md:grid md:grid-cols-3">
            {blogs.map((post) => (
              <Link
                key={post.slug}
                href={`/blogs/${post.slug}`}
                className="min-w-[260px] flex-1 overflow-hidden rounded-xl border border-outline-variant bg-surface snap-start md:min-w-0"
              >
                <img src={post.img} alt={post.title} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <p className="text-xs text-on-surface-variant">{post.date}</p>
                  <h3 className="mt-2 text-base font-semibold">{post.title}</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
      <MobileNav />
    </div>
  );
}
