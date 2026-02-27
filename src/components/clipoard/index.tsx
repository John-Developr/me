import React from "react";
import styles from "@/styles/general/component.module.css";

export default function CopyClipboard() {
  const [copied, setCopied] = React.useState(false);
  const email = "johncarlo.fullstackdev@gmail.com";

  React.useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
    });
  };

  return (
    <div className={styles["container-clipoard"]}>
      <button 
        title="copy" 
        className={`${styles["copy-button"]} ${copied ? styles["did-animate"] : ""}`}
        onClick={handleCopy}>
        <div className={styles["icon-wrapper"]}>
          <Clippy className={`${styles.icon} ${styles.clippy} ${copied ? styles["clippy-copied"] : ""}`} />
          <Check
            isVisible={copied}
            className={`${styles.icon} ${styles.check} ${copied ? styles["check-visible"] : ""}`}
          />
        </div>
      </button>
    </div>
  );
}

// SVG props type with optional visibility
interface SVGPropsWithVisibility extends React.SVGProps<SVGSVGElement> {
  isVisible?: boolean;
}

// Clippy icon
function Clippy({ className, ...props }: SVGPropsWithVisibility) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M5.75 4.75H10.25V1.75H5.75V4.75Z" />
      <path d="M3.25 2.88379C2.9511 3.05669 2.75 3.37987 2.75 3.75001V13.25C2.75 13.8023 3.19772 14.25 3.75 14.25H12.25C12.8023 14.25 13.25 13.8023 13.25 13.25V3.75001C13.25 3.37987 13.0489 3.05669 12.75 2.88379" />
    </svg>
  );
}

// Check icon
function Check({ isVisible = false, className, ...props }: SVGPropsWithVisibility) {
  if (!isVisible) return null;
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M13.25 4.75L6 12L2.75 8.75" />
    </svg>
  );
}