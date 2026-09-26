"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

type BackButtonProps = {
  label?: string;
  className?: string;
};

export function BackButton({ label, className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.back()} className={className}>
      <Icon name="arrow_back" />
      {label ? <span>{label}</span> : null}
    </button>
  );
}
