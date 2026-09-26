import type { ReactNode } from "react";
import { Icon } from "@/components/Icon";

export function SectionHeading({
  title,
  icon,
  action,
}: {
  title: string;
  icon?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <h2 className="flex items-center gap-2 text-xl text-on-surface md:text-2xl">
        {title}
        {icon ? <Icon name={icon} className="text-primary" /> : null}
      </h2>
      {action}
    </div>
  );
}
