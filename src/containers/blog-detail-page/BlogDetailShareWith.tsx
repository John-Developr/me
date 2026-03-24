'use client';

import { useEffect, useState } from "react";
import styles from "@/styles/pages/blog.module.css";
import { FacebookV2 } from "@/components/icons/Facebook";
import { LinkedinV2 } from "@/components/icons/Linkedin";

const BlogDetailShareWith = () => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(encodeURIComponent(window.location.href));
  }, []);

  const platforms: Record<"facebook" | "linkedin", string> = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}`,
  };

  return (
    <section className={styles["share-with"]}>
      <p>SHARE WITH:</p>
      <ul>
        {Object.entries(platforms).map(([name, link]) => (
          <li
            key={name}
            onClick={() => window.open(link, "_blank", "noopener,noreferrer")}
            style={{ cursor: "pointer" }}
            aria-label={`Share on ${name}`}
          >
            {name === "facebook"
              ? <FacebookV2 width={20} height={20} />
              : <LinkedinV2 width={20} height={20} />
            }
          </li>
        ))}
      </ul>
    </section>
  );
}

export default BlogDetailShareWith;