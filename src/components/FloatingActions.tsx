import { Icon } from "@/components/Icon";
import { PHONE, WHATSAPP_LINK } from "@/lib/data";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
      <path d="M20.5 3.5A11 11 0 0 0 2.1 17.3L1 23l5.8-1.1A11 11 0 0 0 20.5 3.5Zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.5.7.7-3.4-.2-.3a9.1 9.1 0 1 1 7.9 4.5Zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.3-.4c.1-.2 0-.3 0-.5l-.9-2.1c-.2-.5-.5-.5-.6-.5h-.5c-.2 0-.5.1-.7.3s-1 1-1 2.3 1 2.7 1.2 2.9 2 3.1 4.9 4.2c1.9.7 2.3.6 2.7.5s1.4-.6 1.6-1.1.2-1 .1-1.1-.3-.2-.6-.3Z" />
    </svg>
  );
}

export function FloatingActions() {
  return (
    <div className="fixed right-4 bottom-24 z-40 flex flex-col gap-3 md:bottom-8">
      <a
        href={`tel:${PHONE}`}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-on-surface shadow-lg ring-1 ring-outline-variant"
        aria-label="Call us"
      >
        <Icon name="call" />
      </a>
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noreferrer"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"
        aria-label="WhatsApp"
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
}
