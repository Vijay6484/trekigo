import Link from "next/link";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { blogs } from "@/lib/data";

export default function BlogsPage() {
  return (
    <div className="pt-16 md:pt-20">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-container-margin-mobile py-10 pb-24 md:px-container-margin-desktop">
        <h1 className="mb-8 text-3xl">Blogs</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {blogs.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="overflow-hidden rounded-xl border border-outline-variant bg-surface"
            >
              <img src={post.img} alt={post.title} className="h-48 w-full object-cover" />
              <div className="p-5">
                <p className="text-xs text-on-surface-variant">{post.date}</p>
                <h2 className="mt-2 text-xl">{post.title}</h2>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
