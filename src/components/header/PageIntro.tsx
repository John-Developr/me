interface PageIntroProps {
  subtitle: string;
  title: string;
  intro: string;
}

export default function PageIntro({ subtitle, title, intro }: PageIntroProps) {
  return (
    <div className="other-page">
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