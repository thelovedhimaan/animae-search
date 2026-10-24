"use client";

import Image from "next/image";
import { useState } from "react";

type SafePortraitProps = {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
  size?: number;
};

export function SafePortrait({ src, alt, fallback, className, size }: SafePortraitProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <span className={className}>{fallback}</span>;
  }

  if (size) {
    return <Image className={className} src={src} alt={alt} width={size} height={size} unoptimized onError={() => setFailed(true)} />;
  }

  return <Image className={className} src={src} alt={alt} fill sizes="7rem" unoptimized onError={() => setFailed(true)} />;
}
