import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { blogs } from "@/lib/data";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogs.find((item) => item.slug === slug);
  if (!post) {
    notFound();
  }

  return (
    <div className="pt-16 md:pt-20">
      <Navbar />
      <main className="mx-auto max-w-3xl px-container-margin-mobile py-10 pb-24 md:px-container-margin-desktop">
        <Link href="/blogs" className="text-sm text-on-surface-variant">
          ← All blogs
        </Link>
        <p className="mt-6 text-sm text-on-surface-variant">{post.date}</p>
        <h1 className="mt-2 text-3xl md:text-4xl">{post.title}</h1>
        <img src={post.img} alt={post.title} className="mt-8 h-64 w-full rounded-xl object-cover" />
        <p className="mt-8 text-base leading-8 text-on-surface-variant">{post.excerpt}</p>
        <p className="mt-4 text-base leading-8 text-on-surface-variant">
          Trekigo stays are picked for weekends that feel easy: honest photos, clear inclusions,
          and hosts who know the hills. Use this guide to plan your next getaway, then book a
          villa, cottage, or camp that matches your group.
        </p>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
