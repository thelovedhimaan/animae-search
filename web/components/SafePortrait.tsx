"use client";

import Image from "next/image";
import { useState } from "react";

type SafePortraitProps = {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
  size?: number;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

export function SafePortrait({ src, alt, fallback, className, size, width, height, sizes = "7rem", priority = false }: SafePortraitProps) {
  const [failed, setFailed] = useState<string>();

  if (!src || failed === src) {
    return <span className={className}>{fallback}</span>;
  }

  if (size || (width && height)) {
    return <Image className={className} src={src} alt={alt} width={width || size} height={height || size} unoptimized onError={() => setFailed(src)} />;
  }

  return <Image className={className} src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized onError={() => setFailed(src)} />;
}
