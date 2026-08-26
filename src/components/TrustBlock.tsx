import { Icon } from "@/components/Icon";
import { reviewAvatar, reviews, socialLinks, trustHighlights } from "@/lib/data";
import { SectionHeading } from "@/components/SectionHeading";

export function TrustBlock() {
  return (
    <>
      <section className="px-container-margin-mobile md:px-container-margin-desktop">
        <SectionHeading title="Why choose Trekigo" />
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-outline-variant bg-surface p-5 md:grid-cols-3 md:p-8">
          {trustHighlights.map((item) => (
            <div key={item.title} className="flex flex-col items-center gap-3 px-4 py-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-primary">
                <Icon name={item.icon} filled className="text-[28px]" />
              </span>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-on-surface-variant">{item.text}</p>
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
              <div className="mb-3 flex gap-0.5 text-primary">
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
              className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm font-medium text-on-surface transition-colors hover:border-primary hover:text-primary"
            >
              <Icon name={social.icon} className="text-primary" />
              {social.short}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
