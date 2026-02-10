'use client';

import Image from "next/image";
import styles from "@/styles/general/component.module.css";

type SkeletonImageProps = {
  path?: string | null;
  className: string;
  width: number | undefined;
  height: number;
  alt: string;
};

export default function SkeletonImage({
  path,
  className,
  width,
  height,
  alt
}: SkeletonImageProps) {
  if (!path) {
    console.log("skeleton...")
    return (
      <div
        className={`${styles.skeleton} ${className ?? ""}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <Image
      src={`${path}?t=${Date.now()}`}
      width={width}
      height={height}
      className={`${className} ${styles.skeleton}`}
      alt={alt}
    />
  );
}
