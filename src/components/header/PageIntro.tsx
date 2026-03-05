'use client'

import { useAnimateIn } from "@/hooks/useAnimateIn";

interface PageIntroProps {
  subtitle: string;
  title: string;
  intro: string;
}

export default function PageIntro({ subtitle, title, intro }: PageIntroProps) {
  const { ref, style } = useAnimateIn<HTMLDivElement>({ delay: 30, duration: 600 });

  return (
    <div className="other-page" ref={ref} style={style}>
      <div className="page-title">
        <h3>{subtitle}</h3>
        <h1>{title}</h1>
      </div>
      <div className="page-intro">
        <p>{intro}</p>
      </div>
    </div>
  );
}