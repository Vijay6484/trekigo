import { Icon } from "@/components/Icon";
import { reviewAvatar, reviews, socialLinks, trustHighlights } from "@/lib/data";
import { SectionHeading } from "@/components/SectionHeading";

export function TrustBlock() {
  return (
    <>
      <section className="px-container-margin-mobile md:px-container-margin-desktop">
        <SectionHeading title="Why choose Trekigo" />
        <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar md:grid md:grid-cols-3 md:overflow-visible">
          {trustHighlights.map((item) => (
            <div
              key={item.title}
              className="flex min-w-[220px] flex-1 items-center gap-4 rounded-xl border border-outline-variant bg-surface px-5 py-4 md:min-w-0"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-high">
                <Icon name={item.icon} filled className="text-[24px]" />
              </span>
              <div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-container-margin-mobile md:px-container-margin-desktop">
        <SectionHeading title="Reviews" />
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="min-w-[280px] flex-1 snap-start rounded-xl border border-outline-variant bg-surface p-5 md:min-w-0"
            >
              <div className="mb-3 flex gap-0.5 text-accent">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon key={star} name="star" filled className="text-sm" />
                ))}
              </div>
              <p className="mb-5 text-sm leading-6 text-on-surface-variant">
                “{review.text}”
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={reviewAvatar}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
                <span className="font-semibold">{review.name}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-container-margin-mobile md:px-container-margin-desktop">
        <SectionHeading title="Follow our journey" />
        <div className="flex flex-wrap gap-3">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:border-on-surface"
            >
              <Icon name={social.icon} />
              {social.short}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
