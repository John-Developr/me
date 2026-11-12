import ReactMarkdown, { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

import styles from "@/styles/pages/blog.module.css";

/**
 * Element overrides for blog Markdown:
 * - `#` headings render as h2, so the post title stays the page's only h1.
 * - External links open in a new tab; site links (`/…`) stay in the tab.
 * - Fenced code with a language (```ts) is syntax highlighted, like the chat.
 */
const components: Components = {
  h1: ({ children }) => <h2>{children}</h2>,

  a: ({ href = "", children }) => {
    const external = /^https?:\/\//i.test(href);
    return external
      ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
      : <a href={href}>{children}</a>;
  },

  code: ({ className, children }) => {
    const language = /language-(\w+)/.exec(className ?? "")?.[1];
    if (!language) return <code className={className}>{children}</code>;

    return (
      <SyntaxHighlighter
        PreTag="div"
        language={language}
        style={dracula}
        customStyle={{ margin: 0, borderRadius: 10, fontSize: "0.9rem" }}>
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    );
  },
};

/**
 * Renders a blog post's Markdown (CommonMark: headings, bold, italic,
 * lists, quotes, links, inline code, code blocks, rules) with the blog's
 * typography. Used by the public post page and the admin editor preview,
 * so the preview matches the live post. Raw HTML is not rendered.
 */
export default function BlogMarkdown({ content }: { content: string }) {
  return (
    <div className={styles.prose}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
